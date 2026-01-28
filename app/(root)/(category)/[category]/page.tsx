import { Suspense } from "react"
import { Share2 } from "lucide-react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getNewsByCategory } from "@/lib/services/news-api.service"
import { prisma } from "@/lib/prisma"
import { NewsCard } from "@/components/news/news-card"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import type { Article } from "@/constants/news-data"
import { lexicalToHTML } from "@/lib/utils/lexical-to-html"
import { mapToArticle } from "@/lib/utils/news-mapper-unified"
import type { NewsResponse } from "@/lib/services/news-api.service"
import { cn } from "@/lib/utils"

// Enterprise cache configuration
export const revalidate = 60 // Revalidate every 60 seconds

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

/**
 * Generate metadata for category page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;

  const category = await prisma.menu.findUnique({
    where: {
      slug: categorySlug,
      isPublic: true,
      isActive: true
    },
    select: {
      name: true,
      slug: true,
    },
  });

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} - News Category`,
    description: `Latest news and articles in ${category.name} category`,
    openGraph: {
      title: `${category.name} - News Category`,
      description: `Latest news and articles in ${category.name} category`,
      type: "website",
    },
  };
}

/**
 * Map database news to Article interface for NewsCard component
 */
function mapNewsToArticle(news: NewsResponse): Article {

  // Use unified mapper for base mapping
  const article = mapToArticle(news);

  // Convert Lexical JSON to HTML for excerpt if content exists
  if (news.content) {
    const htmlContent = lexicalToHTML(news.content);
    article.content = htmlContent;
    article.fullContent = htmlContent;
    // Update excerpt if not already set
    if (!article.excerpt && htmlContent) {
      article.excerpt = htmlContent.substring(0, 200) + "...";
    }
    // Recalculate read time based on actual content
    article.readTime = `${Math.ceil((htmlContent.length || 1000) / 500)} Mins Read`;
  }

  return article;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  // Verify category exists and is public
  const category = await prisma.menu.findUnique({
    where: {
      slug: categorySlug,
      isPublic: true,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });

  // If category doesn't exist, show 404
  if (!category) {
    notFound();
  }

  // Fetch news from this category
  const result = await getNewsByCategory(
    {
      slug: categorySlug,
      includeChildren: false, // Only show direct category news
    },
    {
      page,
      limit: 50,
      includeContent: false,
      includeAuthor: true,
      includeCategories: true,
    }
  );

  // Map news to Article format for NewsCard using unified mapper
  const articles: Article[] = result.data.map(mapNewsToArticle)
  const totalPages = result.pagination.totalPages

  return (
    <div className="space-y-6">
      {/* Category Header with Share */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase">
            {category.name}
          </h1>
          {/* {result.pagination.total > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {result.pagination.total} {result.pagination.total === 1 ? "article" : "articles"} found
            </p>
          )} */}
        </div>

        {/* <Button
          variant="outline"
          className="hidden md:flex rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button> */}
      </div>

      {/* News List with Suspense fallback */}
      <div className="flex flex-col gap-4">
        <Suspense fallback={<LoadingSkeleton />}>
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </Suspense>

        {articles.length === 0 && (
          <div className="py-20 text-center text-zinc-500">No articles found in this category.</div>
        )}
      </div>

      {/* Pagination - Modern Responsive Design */}
      {totalPages > 1 && (
        <div className="mt-12 py-6 border-t border-zinc-800">
          <Pagination className="w-full">
            <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-2">
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  size="default"
                  href={`/${encodeURIComponent(categorySlug)}?page=${Math.max(1, page - 1)}`}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-zinc-800 hover:text-white border-zinc-700"
                  }
                />
              </PaginationItem>

              {/* Smart Page Number Display */}
              {(() => {
                const pages: (number | "ellipsis")[] = []
                const maxVisiblePages = 7 // Show max 7 page numbers on desktop
                const mobileVisiblePages = 3 // Show max 3 page numbers on mobile

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i)
                  }
                } else {
                  // Smart pagination with ellipsis
                  const showEllipsis = totalPages > maxVisiblePages

                  if (page <= 3) {
                    // Near the beginning
                    for (let i = 1; i <= 4; i++) {
                      pages.push(i)
                    }
                    pages.push("ellipsis")
                    pages.push(totalPages)
                  } else if (page >= totalPages - 2) {
                    // Near the end
                    pages.push(1)
                    pages.push("ellipsis")
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // In the middle
                    pages.push(1)
                    pages.push("ellipsis")
                    for (let i = page - 1; i <= page + 1; i++) {
                      pages.push(i)
                    }
                    pages.push("ellipsis")
                    pages.push(totalPages)
                  }
                }

                return pages.map((p, index) => {
                  if (p === "ellipsis") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
                        <PaginationEllipsis className="text-zinc-500" />
                      </PaginationItem>
                    )
                  }

                  const isCurrent = p === page
                  const isMobileVisible =
                    p === page ||
                    p === page - 1 ||
                    p === page + 1 ||
                    p === 1 ||
                    p === totalPages

                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        size="default"
                        href={`/${encodeURIComponent(categorySlug)}?page=${p}`}
                        isActive={isCurrent}
                        className={cn(
                          // Base styles
                          "min-w-[2.5rem] h-10 border transition-all",
                          // Mobile: only show current and adjacent pages
                          isMobileVisible ? "flex" : "hidden sm:flex",
                          // Active state
                          isCurrent
                            ? "bg-zinc-100 text-black border-zinc-300 hover:bg-zinc-200 font-semibold"
                            : "border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                          // Responsive sizing
                          "text-sm sm:text-base"
                        )}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })
              })()}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  size="default"
                  href={`/${encodeURIComponent(categorySlug)}?page=${Math.min(totalPages, page + 1)}`}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-zinc-800 hover:text-white border-zinc-700"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Mobile-friendly page info */}
          <div className="mt-4 text-center text-sm text-zinc-500 sm:hidden">
            Page {page} of {totalPages}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row gap-6 p-6 border border-zinc-800 rounded-xl bg-[#1a1a1a] animate-pulse"
        >
          <div className="w-full md:w-64 h-48 md:h-40 bg-zinc-800 rounded-lg" />
          <div className="flex-1 space-y-4 py-2">
            <div className="h-8 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-16 bg-zinc-800 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

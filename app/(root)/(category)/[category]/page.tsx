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
import { lexicalToHTML, lexicalToText } from "@/lib/utils/lexical-to-html"
import { mapToArticle } from "@/lib/utils/news-mapper-unified"
import type { NewsResponse } from "@/lib/services/news-api.service"
import { cn } from "@/lib/utils"

// Categories that will display a home-page style featured section at the top
const FEATURED_LAYOUT_CATEGORIES = ["jharkhand", "bihar", "ranchi", "jamshedpur", "delhi", "uttarakhand", "uttar-pradesh", "madhya-pradesh", "chhattisgarh"];

// Enterprise cache configuration
export const revalidate = 60 // Revalidate every 60 seconds

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

import { StateFeaturedSection } from "@/components/news/state-featured-section"
import { NewsSidebar } from "@/components/news/sidebar"

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

    // SAFE EXCERPT: Use plain text conversion to avoid broken HTML tags
    if (!article.excerpt) {
      const plainText = lexicalToText(news.content);
      article.excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? "..." : "");
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
  // If featured layout is used, fetch more to fill the section
  const isFeaturedLayout = FEATURED_LAYOUT_CATEGORIES.includes(categorySlug);
  const fetchLimit = isFeaturedLayout ? 65 : 50;

  const result = await getNewsByCategory(
    {
      slug: categorySlug,
      includeChildren: false, // Only show direct category news
    },
    {
      page,
      limit: fetchLimit,
      includeContent: false,
      includeAuthor: true,
      includeCategories: true,
    }
  );

  // Map all raw news to Article format
  const allArticles: Article[] = result.data.map(mapNewsToArticle)

  // Data for Featured Section (if applicable)
  let featuredStateData = null;
  let articles: Article[] = allArticles;

  if (isFeaturedLayout && page === 1 && allArticles.length >= 14) {
    // 1. Prepare New Magazine Featured Design Data (Matching Mockup + Enhancements)
    // - mainFeatured (1)
    // - gridFeatured (2)
    // - listFeatured (6)
    // - stateSpecial (5)

    featuredStateData = {
      mainFeatured: allArticles[0],
      gridFeatured: allArticles.slice(1, 3),
      listFeatured: allArticles.slice(3, 9),
      stateSpecial: allArticles.slice(9, 14)
    };

    // 2. Standard Feed starts after the first 14 articles used above
    articles = allArticles.slice(14);
  }

  const totalPages = result.pagination.totalPages

  return (
    <div className="flex flex-col gap-12">
      <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-[#FF6B35] pl-4 py-1 leading-none">
        {category.name}
      </h2>
      {/* 1. Enhanced Full-Width Featured Hero (Unique Layout) */}
      {featuredStateData && (
        <div className="w-full">
          <StateFeaturedSection {...featuredStateData} />
        </div>
      )}

      {/* 2. Content + Sidebar (Standard 75/25 magazine layout) */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Content Column (approx 72%-75%) */}
        <div className="w-full lg:w-[72%] flex flex-col gap-8">
          <div className="flex flex-col gap-6">


            <div className="flex flex-col gap-2">
              <Suspense fallback={<LoadingSkeleton />}>
                {articles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </Suspense>

              {articles.length === 0 && (
                <div className="py-20 text-center text-zinc-500 bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800">
                  No articles found in this category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (approx 25%-28%) */}
        <div className="w-full lg:w-[28%] flex flex-col gap-8">
          <Suspense fallback={<div className="h-[600px] w-full bg-zinc-900/50 animate-pulse rounded-xl" />}>
            <NewsSidebar />
          </Suspense>
        </div>
      </div>

      {/* 3. Global Pagination */}
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

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i)
                  }
                } else {
                  // Smart pagination with ellipsis
                  if (page <= 3) {
                    for (let i = 1; i <= 4; i++) pages.push(i)
                    pages.push("ellipsis")
                    pages.push(totalPages)
                  } else if (page >= totalPages - 2) {
                    pages.push(1)
                    pages.push("ellipsis")
                    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    pages.push("ellipsis")
                    for (let i = page - 1; i <= page + 1; i++) pages.push(i)
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
                    p === page || p === page - 1 || p === page + 1 || p === 1 || p === totalPages

                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        size="default"
                        href={`/${encodeURIComponent(categorySlug)}?page=${p}`}
                        isActive={isCurrent}
                        className={cn(
                          "min-w-[2.5rem] h-10 border transition-all",
                          isMobileVisible ? "flex" : "hidden sm:flex",
                          isCurrent
                            ? "bg-zinc-100 text-black border-zinc-300 hover:bg-zinc-200 font-semibold"
                            : "border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
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
          className="flex flex-col md:flex-row gap-6 p-0 border-b border-zinc-800 pb-6 mb-6 last:border-0 bg-transparent animate-pulse"
        >
          <div className="w-full md:w-64 aspect-video bg-zinc-800 rounded-lg" />
          <div className="flex-1 space-y-4 py-0 md:py-2">
            <div className="h-8 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/4" />
            <div className="h-12 bg-zinc-800 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}


import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getNewsByAuthor } from "@/lib/services/news-api.service"
import { prisma } from "@/lib/prisma"
import { NewsCard } from "@/components/news/news-card"
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
import Image from "next/image"

// Enterprise cache configuration
export const revalidate = 60 // Revalidate every 60 seconds

interface PageProps {
    params: Promise<{ username: string }>
    searchParams: Promise<{ page?: string }>
}

/**
 * Generate metadata for author page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;

    const author = await prisma.user.findUnique({
        where: {
            username: username,
            isActive: true
        },
        select: {
            firstName: true,
            lastName: true,
            username: true,
        },
    });

    if (!author) {
        return {
            title: "Author Not Found",
        };
    }

    const fullName = `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.username;

    return {
        title: `${fullName} - Author Profile | Naxatra News`,
        description: `Read the latest articles and reports by ${fullName} on Naxatra News.`,
        openGraph: {
            title: `${fullName} - Author Profile`,
            description: `Read the latest articles and reports by ${fullName} on Naxatra News.`,
            type: "website",
        },
    };
}

/**
 * Map database news to Article interface
 */
function mapNewsToArticle(news: NewsResponse): Article {
    const article = mapToArticle(news);

    if (news.content) {
        const htmlContent = lexicalToHTML(news.content);
        article.content = htmlContent;
        article.fullContent = htmlContent;

        if (!article.excerpt) {
            const plainText = lexicalToText(news.content);
            article.excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? "..." : "");
        }

        article.readTime = `${Math.ceil((htmlContent.length || 1000) / 500)} Mins Read`;
    }

    return article;
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
    const { username } = await params
    const { page: pageParam } = await searchParams
    const page = Number(pageParam) || 1

    // Verify author exists
    const author = await prisma.user.findUnique({
        where: {
            username: username,
            isActive: true
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
        },
    });

    if (!author) {
        notFound();
    }

    const fullName = `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.username;

    // Fetch news from this author
    const result = await getNewsByAuthor(
        author.id,
        {
            page,
            limit: 12,
            includeContent: false,
            includeAuthor: true,
            includeCategories: true,
        }
    );

    const articles: Article[] = result.data.map(mapNewsToArticle)
    const totalPages = result.pagination.totalPages

    return (
        <div className="space-y-10">
            {/* Compact Author Banner matching Theme */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 md:p-6 mb-8 shadow-sm">
                <div className="relative flex flex-row items-center gap-6">
                    {/* Compact Avatar */}
                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border border-border shadow-md flex-shrink-0">
                        <Image
                            src={author.avatar || "/assets/logo.png"}
                            alt={fullName}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground uppercase">
                                    {fullName}
                                </h1>
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                    Author
                                </span>
                            </div>
                            <p className="text-primary font-semibold text-sm">@{author.username}</p>
                        </div>

                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl font-normal line-clamp-2">
                            Professional journalist at Naxatra News, delivering factual and timely news coverage.
                        </p>

                        <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded border border-border text-foreground text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                {result.pagination.total} Articles
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Section Title */}
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                        Latest Reports
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                </div>

                {/* News List - Category Style */}
                <div className="flex flex-col gap-4">
                    <Suspense fallback={<LoadingSkeleton />}>
                        {articles.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </Suspense>

                    {articles.length === 0 && (
                        <div className="py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800 font-bold uppercase tracking-widest">
                            No reports published yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination - Matching Category style */}
            {totalPages > 1 && (
                <div className="mt-12 py-8 border-t border-zinc-800">
                    <Pagination className="w-full">
                        <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    size="default"
                                    href={`/author/${username}?page=${Math.max(1, page - 1)}`}
                                    className={
                                        page === 1
                                            ? "pointer-events-none opacity-50"
                                            : "hover:bg-zinc-800 hover:text-white border-zinc-700"
                                    }
                                />
                            </PaginationItem>

                            {(() => {
                                const pages: (number | "ellipsis")[] = []
                                const maxVisiblePages = 5

                                if (totalPages <= maxVisiblePages) {
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(i)
                                    }
                                } else {
                                    if (page <= 2) {
                                        for (let i = 1; i <= 3; i++) {
                                            pages.push(i)
                                        }
                                        pages.push("ellipsis")
                                        pages.push(totalPages)
                                    } else if (page >= totalPages - 1) {
                                        pages.push(1)
                                        pages.push("ellipsis")
                                        for (let i = totalPages - 2; i <= totalPages; i++) {
                                            pages.push(i)
                                        }
                                    } else {
                                        pages.push(1)
                                        pages.push("ellipsis")
                                        pages.push(page)
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
                                    return (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                size="default"
                                                href={`/author/${username}?page=${p}`}
                                                isActive={isCurrent}
                                                className={cn(
                                                    "min-w-[2.5rem] h-10 border transition-all",
                                                    isCurrent
                                                        ? "bg-primary text-white border-primary hover:bg-primary/90 font-black"
                                                        : "border-zinc-800 hover:bg-zinc-800 hover:text-white",
                                                    "text-sm sm:text-base font-bold"
                                                )}
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                })
                            })()}

                            <PaginationItem>
                                <PaginationNext
                                    size="default"
                                    href={`/author/${username}?page=${Math.min(totalPages, page + 1)}`}
                                    className={
                                        page === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : "hover:bg-zinc-800 hover:text-white border-zinc-700"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
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

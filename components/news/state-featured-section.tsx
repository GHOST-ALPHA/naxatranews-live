import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Article } from "@/constants/news-data"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import SectionHeader from "@/components/home/SectionHeader"
import { AdLeaderboard } from "@/components/ads/ad-leaderboard"

interface StateFeaturedSectionProps {
    mainFeatured: Article | null
    gridFeatured: Article[] // 2 articles for top grid
    listFeatured: Article[] // 6 articles for bottom list
    stateSpecial: Article[] // 5 articles for bottom row
}

export function StateFeaturedSection({
    mainFeatured,
    gridFeatured,
    listFeatured,
    stateSpecial,
}: StateFeaturedSectionProps) {
    if (!mainFeatured) return null;

    return (
        <div className="lg:px-0">
            <div className="flex flex-col gap-10 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: TYPOGRAPHY-FIRST HERO (approx 45%) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <article className="group flex flex-col gap-5">
                            <div className="flex flex-col gap-3">
                                <Link href={`/news/${mainFeatured.slug}`} prefetch={false} className="block transition-colors hover:text-[#FF6B35]">
                                    <h1 className="text-xl md:text-2xl font-black leading-[1.1] transition-colors hindi-clamp hindi-clamp-4" title={mainFeatured.title}>
                                        {mainFeatured.title}
                                    </h1>
                                </Link>
                                {mainFeatured.excerpt && (
                                    <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed hindi-clamp hindi-clamp-3">
                                        {mainFeatured.excerpt}
                                    </p>
                                )}
                            </div>

                            <Link href={`/news/${mainFeatured.slug}`} prefetch={false} className="block overflow-hidden rounded-xl border border-border/20 dark:border-zinc-800">
                                <div className="relative aspect-[16/9] w-full">
                                    <OptimizedArticleImage
                                        src={mainFeatured.image || "/assets/newsplaceholder.webp"}
                                        alt={mainFeatured.title}
                                        priority
                                        aspectRatio="16/9"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                                        className="h-full w-full"
                                        imageClassName="transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                            </Link>

                            <div className="mt-2 w-full">
                                <AdLeaderboard position={0} showDefault={true} size="leaderboard" />
                            </div>
                        </article>
                    </div>

                    {/* RIGHT COLUMN: HIGH DENSITY GRID (approx 55%) */}
                    <div className="lg:col-span-7 flex flex-col gap-8">

                        {/* TOP CARDS - Magazine Cards style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-border/40">
                            {gridFeatured.slice(0, 2).map((item) => (
                                <article key={item.id} className="group overflow-hidden rounded-xl border border-border/40 bg-card p-2 shadow-sm transition-all hover:shadow-md">
                                    <Link href={`/news/${item.slug}`} prefetch={false} className="block overflow-hidden rounded-lg">
                                        <div className="relative aspect-[16/10] w-full">
                                            <OptimizedArticleImage
                                                src={item.image || "/assets/newsplaceholder.webp"}
                                                alt={item.title}
                                                aspectRatio="16/10"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 350px"
                                                className="h-full w-full"
                                                imageClassName="transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    </Link>
                                    <div className="p-2 pt-3">
                                        <Link href={`/news/${item.slug}`} prefetch={false} className="block transition-colors hover:text-[#FF6B35]">
                                            <h2 className="text-lg md:text-xl font-bold leading-tight transition-colors hindi-clamp hindi-clamp-3" title={item.title}>
                                                {item.title}
                                            </h2>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* LIST GRID - Horizontal small cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {listFeatured.slice(0, 6).map((item) => (
                                <article key={item.id} className="group rounded-lg transition-all hover:bg-muted/10">
                                    <Link href={`/news/${item.slug}`} prefetch={false} className="flex gap-4">
                                        <div className="relative h-[68px] w-28 shrink-0 overflow-hidden rounded-lg border border-border/20">
                                            <OptimizedArticleImage
                                                src={item.image || "/assets/newsplaceholder.webp"}
                                                alt={item.title}
                                                aspectRatio="16/9"
                                                sizes="120px"
                                                className="h-full w-full"
                                                imageClassName="transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h3 className="text-[15px] font-bold leading-snug transition-colors group-hover:text-[#FF6B35] hindi-clamp hindi-clamp-3" title={item.title}>
                                                {item.title}
                                            </h3>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STATE SPECIALS - Row of 5 cards */}
                <div className="mt-4 pt-2 border-t border-border/40">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mt-6">
                        {stateSpecial.slice(0, 5).map((item) => (
                            <article key={item.id} className="group flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-2 shadow-sm transition-all hover:shadow-md">
                                <Link href={`/news/${item.slug}`} prefetch={false} className="block overflow-hidden rounded-lg">
                                    <div className="relative aspect-[16/9] w-full">
                                        <OptimizedArticleImage
                                            src={item.image || "/assets/newsplaceholder.webp"}
                                            alt={item.title}
                                            aspectRatio="16/9"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
                                            className="h-full w-full"
                                            imageClassName="transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </Link>
                                <div className="px-1 pb-1">
                                    <Link href={`/news/${item.slug}`} prefetch={false} className="transition-colors hover:text-[#FF6B35]">
                                        <h3 className="text-sm font-bold leading-snug hindi-clamp hindi-clamp-3" title={item.title}>
                                            {item.title}
                                        </h3>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

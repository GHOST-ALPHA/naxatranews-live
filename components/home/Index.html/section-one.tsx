import Link from "next/link"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SectionHeader from "../SectionHeader"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import dynamic from "next/dynamic"

const AdSidebar = dynamic(() => import("@/components/ads/ad-sidebar").then(mod => mod.AdSidebar), {
    loading: () => <div className="w-full h-full min-h-[250px] bg-muted/10 animate-pulse rounded-lg" />
})

interface Article {
    id: string
    title: string
    excerpt: string
    image: string
    category: string
    date: string
    author: string
    isLive?: boolean
}


interface SmallArticle {
    id: string
    title: string
    image: string
}

interface FeaturedSectionProps {
    categoryName?: string
    featuredArticle: Article | null
    sideArticles: Article[]
    rightArticles: SmallArticle[]
}

export function OneSection({
    categoryName = "TECHNOLOGY",
    featuredArticle,
    sideArticles,
    rightArticles
}: FeaturedSectionProps) {
    if (!featuredArticle) return null;

    // Use a logical category slug based on name
    const categoryHref = `/${categoryName.toLowerCase()}`;

    return (
        <section className="container mx-auto px-4 py-10 feature-section-font">
            <SectionHeader title={categoryName} href={categoryHref} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* 1. Left: Main Featured Article (6 units) - Overlay Style */}
                <div className="lg:col-span-6 group relative overflow-hidden rounded-xl">
                    <Link href={`/news/${featuredArticle.id}`} className="block w-full h-full relative">
                        <div className="w-full h-full aspect-video lg:aspect-[16/10]">
                            <OptimizedArticleImage
                                src={featuredArticle.image || "/placeholder.svg?height=1000&width=800"}
                                alt={featuredArticle.title}
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {featuredArticle.isLive && (
                                <div className="absolute left-4 top-4 z-30">
                                    <div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                                        <span className="size-2 rounded-full bg-white" />
                                        LIVE
                                    </div>
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                            {/* Text Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white drop-shadow-md mb-2">
                                    {featuredArticle.title}
                                </h1>
                                {/* Optional: Excerpt hidden on smaller screens for cleaner look or shown if needed */}
                                <p className="text-white/90 text-xs md:text-sm line-clamp-2 hidden sm:block">
                                    {featuredArticle.excerpt}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 2. Middle: Single Side Article (3 units) - Card Style */}
                <div className="lg:col-span-3">
                    {sideArticles.length > 0 && (
                        <article className="group flex flex-col gap-3 h-full">
                            <Link href={`/news/${sideArticles[0].id}`} className="flex flex-col gap-3 h-full">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-sm">
                                    <OptimizedArticleImage
                                        src={sideArticles[0].image || "/placeholder.svg?height=600&width=1200"}
                                        alt={sideArticles[0].title}
                                        sizes="(max-width: 1024px) 100vw, 25vw"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        imageClassName="hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-col justify-between flex-1 space-y-2">
                                    <div>
                                        <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-red-600 line-clamp-4">
                                            {sideArticles[0].title}
                                        </h3>
                                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                                            {sideArticles[0].excerpt}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground pt-2">
                                        {sideArticles[0].date || "Updated just now"}
                                    </p>
                                </div>
                            </Link>
                        </article>
                    )}
                </div>

                {/* 3. Right: Ad Placeholder (3 units) - Gray Box */}
                <div className="lg:col-span-3">
                    <div className="w-full h-full min-h-[250px] bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center p-4">
                        <div className="w-full h-full">
                            <AdSidebar position={0} showDefault={true} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: 4 Column Grid for Small Articles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-border/40">
                {rightArticles.slice(0, 4).map((article) => (
                    <article key={article.id} className="group border-b lg:border-b-0 border-border/50 pb-6 lg:pb-0">
                        <Link href={`/news/${article.id}`} className="flex flex-col gap-4">
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm shadow-sm group-hover:shadow-md transition-all">
                                <OptimizedArticleImage
                                    src={article.image || "/placeholder.svg?height=400&width=600"}
                                    alt={article.title}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    aspectRatio="16/9"
                                    className="w-full h-full"
                                    imageClassName="transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="headlines-title transition-colors group-hover:text-red-600">
                                    {article.title}
                                </h3>
                            </div>
                        </Link>
                    </article>
                ))}


            </div>
        </section>
    )
}

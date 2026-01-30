import Link from "next/link"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SectionHeader from "../SectionHeader"
import { AdSidebar } from "@/components/ads/ad-sidebar"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"

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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
                {/* Left: Advertisement Column (3 units) */}
                <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24">
                    <div className="space-y-6">
                        <AdSidebar position={0} showDefault={true} />
                        <AdSidebar position={1} showDefault={true} />
                    </div>
                </div>

                {/* Middle: Large Featured Article (6 units) */}
                <div className="lg:col-span-6 group">
                    <article className="h-full">
                        <Link href={`/news/${featuredArticle.id}`} className="block relative h-full overflow-hidden rounded-sm shadow-sm transition-all duration-500 hover:shadow-xl group">
                            <div className="relative aspect-[16/10] lg:aspect-[4/5] xl:aspect-[16/20] w-full lg:h-[650px]">
                                <OptimizedArticleImage
                                    src={featuredArticle.image || "/placeholder.svg?height=1000&width=800"}
                                    alt={featuredArticle.title}
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    aspectRatio="auto"
                                    className="w-full h-full"
                                    imageClassName="transition-transform duration-700 group-hover:scale-105"
                                />

                                {featuredArticle.isLive && (
                                    <div className="absolute left-5 top-5 z-30">
                                        <div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                                            <span className="size-2 rounded-full bg-white" />
                                            LIVE UPDATES
                                        </div>
                                    </div>
                                )}

                                {/* Premium Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                    <h1 className="mb-4 text-balance text-2xl md:text-3xl font-bold leading-tight text-white drop-shadow-md">
                                        {featuredArticle.title}
                                    </h1>
                                    <p className="line-clamp-3 text-white/80 text-xs md:text-sm">
                                        {featuredArticle.excerpt}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </article>
                </div>

                {/* Right: Side Articles (3 units) */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    {sideArticles.slice(0, 3).map((article) => (
                        <article key={article.id} className="group border-b border-border/50 pb-6 last:border-0 last:pb-0">
                            <Link href={`/news/${article.id}`} className="flex flex-col gap-4">
                                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-lg">
                                    <OptimizedArticleImage
                                        src={article.image || "/placeholder.svg?height=600&width=1200"}
                                        alt={article.title}
                                        sizes="(max-width: 1024px) 100vw, 25vw"
                                        aspectRatio="16/10"
                                        className="w-full h-full"
                                        imageClassName="transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-bold leading-snug transition-colors group-hover:text-red-600">
                                        {article.title}
                                    </h3>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>

            {/* Bottom Row: 4 Column Grid for Small Articles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

                {/* Horizontal Advertisement Placeholder or Real Ad */}
                <div className="lg:col-span-4 mt-10">
                    <div className="w-full py-1 border-y border-border/30">
                        <AdSidebar showDefault={true} />
                    </div>
                </div>
            </div>
        </section>
    )
}

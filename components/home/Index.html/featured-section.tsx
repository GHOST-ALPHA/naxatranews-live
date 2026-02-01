import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Article } from "@/constants/news-data"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import dynamic from "next/dynamic";
import { env } from "@/lib/config/env";
import { AdLeaderboard } from "@/components/ads/ad-leaderboard"

const LiveTvPlayer = dynamic(() => import("@/components/widgets/live-tv-player"), {
  loading: () => (
    <div className="w-full aspect-video bg-black/10 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-muted-foreground text-sm">...</span>
    </div>
  ),
});

interface FeaturedSectionProps {
  mainFeatured: Article | null
  middleFeatured: Article[]
  rightTopFeatured: Article | null
  rightListMostViewed: Article[]
  breakingNews: Article[]
}

export function FeaturedSection({
  mainFeatured,
  middleFeatured,
  rightListMostViewed,
  breakingNews,
}: FeaturedSectionProps) {
  return (
    <section className="container mx-auto px-4 lg:px-0 feature-section-font">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Main Feature */}
        <div className="lg:col-span-5">
          <article className="group flex flex-col gap-2">
            <div className="flex flex-col gap-3">
              {/* <div className="flex items-center gap-3">
                <Badge className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white hover:bg-red-700">
                  Top News
                </Badge>
                <time className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {mainFeatured?.date || ""}
                </time>
              </div> */}
              <Link href={`/news/${mainFeatured?.slug || "#"}`} prefetch={false} className="block transition-colors hover:text-red-600">
                <h1 className="leading-tight transition-colors hindi-clamp hindi-clamp-4" title={mainFeatured?.title}>
                  {mainFeatured?.title || ""}
                </h1>
              </Link>
              {mainFeatured?.excerpt && (
                <p className="feature-section-description hindi-clamp hindi-clamp-3">
                  {mainFeatured?.excerpt}
                </p>
              )}
            </div>

            <Link href={`/news/${mainFeatured?.slug || "#"}`} prefetch={false} className="block overflow-hidden rounded-sm ">
              <div className="relative aspect-[16/9] w-full">
                <OptimizedArticleImage
                  src={mainFeatured?.image || "/assets/newsplaceholder.webp"}
                  alt={mainFeatured?.title || ""}
                  videoUrl={mainFeatured?.video}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  aspectRatio="16/9"
                  className="h-full w-full"
                  imageClassName="transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Link>

            {/* News Just In - Refined with Thumbnails and Borders */}
            {breakingNews.length > 0 && (
              <div className="mt-2 pt-3">
                <div className="flex flex-col">
                  {breakingNews.slice(0, 2).map((item, index) => (
                    <article
                      key={item.id}
                      className={cn(
                        "group py-3 first:pt-0 last:pb-0",
                        index !== 1 && "border-b border-border/50"
                      )}
                    >
                      <Link href={`/news/${item.slug}`} prefetch={false} className="flex gap-3">
                        <div className="relative h-16 w-28 md:h-20 md:w-36 shrink-0 overflow-hidden rounded-sm">
                          <OptimizedArticleImage
                            src={item.image || "/assets/newsplaceholder.webp"}
                            alt={item.title}
                            videoUrl={item.video}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                            aspectRatio="16/9"
                            className="h-full w-full"
                            imageClassName="transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex flex-col justify-start">
                          <h3 className="headlines-title transition-colors hover:text-red-600 hindi-clamp hindi-clamp-3" title={item.title}>
                            {item.title}
                          </h3>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Center Column: List View */}
        <div className="lg:col-span-4">
          <div className="flex flex-col">
            {middleFeatured.slice(0, 6).map((article, index) => (
              <article
                key={article.id}
                className={cn(
                  "group py-4 first:pt-0 last:pb-0",
                  index !== 5 && "border-b border-border/50"
                )}
              >
                <Link href={`/news/${article.slug}`} prefetch={false} className="flex gap-3">
                  <div className="relative h-16 w-28 md:h-20 md:w-36 shrink-0 overflow-hidden rounded-sm">
                    <OptimizedArticleImage
                      src={article.image || "/assets/newsplaceholder.webp"}
                      alt={article.title}
                      videoUrl={article.video}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      aspectRatio="16/9"
                      className="h-full w-full"
                      imageClassName="transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col justify-start">
                    <h3 className="content-title transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-3" title={article.title}>
                      {article.title}
                    </h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-6">
            {/* Live Tv Widgets */}
            {env.NEXT_PUBLIC_LIVE_TV_ENABLED && (
              <div className="mb-0">
                <LiveTvPlayer />
              </div>
            )}

            {/* Ads section */}
            <div className="space-y-3">
              <AdLeaderboard position={0} showDefault={true} size="leaderboard" />
              <AdLeaderboard position={1} showDefault={true} size="leaderboard" />
            </div>
          </div>
        </div>
      </div>

      {/* Must Read Section - Horizontal 5 Card Layout */}
      <div className="my-6 border-t border-border/50 pt-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {rightListMostViewed.slice(0, 5).map((item) => (
            <article key={item.id} className="group flex flex-col gap-4">
              <Link href={`/news/${item.slug}`} prefetch={false} className="block overflow-hidden rounded-sm">
                <div className="relative aspect-[16/9] w-full">
                  <OptimizedArticleImage
                    src={item.image || "/assets/newsplaceholder.webp"}
                    alt={item.title}
                    videoUrl={item.video}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    aspectRatio="16/9"
                    className="h-full w-full"
                    imageClassName="transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </Link>
              <Link href={`/news/${item.slug}`} prefetch={false} className="transition-colors hover:text-red-600">
                <h3 className="headlines-title hindi-clamp hindi-clamp-3" title={item.title}>
                  {item.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

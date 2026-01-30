import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/constants/news-data"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import dynamic from "next/dynamic";

const LiveTvPlayer = dynamic(() => import("@/components/widgets/live-tv-player"), {
  loading: () => (
    <div className="w-full aspect-video bg-black/10 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading Player...</span>
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
  rightTopFeatured,
  rightListMostViewed,
  breakingNews,
}: FeaturedSectionProps) {
  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* Left Column: Main Feature & News Just In (50%) - Was Middle */}
        <div className="lg:col-span-6">
          <div className="mb-2 flex items-center gap-2">
            <Badge className="rounded bg-[#FF6B35] px-2 py-0.5 text-xs font-bold uppercase text-white hover:bg-[#E55A2B]">
              Live Updates
            </Badge>
            <time className="text-xs text-muted-foreground">Updated: {mainFeatured?.date || ""}</time>
          </div>

          <article>
            <Link href={`/news/${mainFeatured?.slug || "#"}`} className="group block hover:text-red-500 ">
              <h2 className="mb-4 feature-section-font ">
                {mainFeatured?.title || ""}
              </h2>

              <OptimizedArticleImage
                src={mainFeatured?.image || "/assets/newsplaceholder.webp"}
                alt={mainFeatured?.title || ""}
                videoUrl={mainFeatured?.video}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                aspectRatio="16/10"
                className="mb-4 rounded"
                imageClassName="group-hover:scale-105"
              />

              <p className="mb-8 expert">
                {mainFeatured?.excerpt || ""}
              </p>
            </Link>
          </article>

          {/* News Just In */}
          {breakingNews.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#FF6B35]">News Just In</h4>
              <ul className="space-y-2">
                {breakingNews.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#FF6B35]" />
                    <Link
                      href={`/news/${item.slug}`}
                      className="font-serif text-sm font-medium leading-snug hover:text-red-500 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Middle Column: Vertical Stack (25%) - Was Left */}
        <div className="flex flex-col gap-6 border-l border-border/20 lg:col-span-3 lg:border-l lg:pl-4">
          {middleFeatured.map((article, index) => {
            const isFirst = index === 0;
            const isLast = index === middleFeatured.length - 1;

            return (
              <article key={article.id} className={index !== 0 ? "border-t border-border pt-4" : ""}>
                <Link href={`/news/${article.slug}`} className="group block hover:text-red-500">
                  {/* Show image only for first and last items */}
                  {(isFirst || isLast) && article.image && (
                    <div className="mb-2">
                      <OptimizedArticleImage
                        src={article.image}
                        alt={article.title}
                        videoUrl={article.video}
                        sizes="(max-width: 768px) 100vw, 25vw"
                        aspectRatio="3/2"
                        className="rounded-sm"
                        imageClassName="group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="mb-2 font-serif text-xl font-bold leading-tight ">
                    {article.title}
                  </h3>
                  {/* Show excerpt only for first item (not middle or last) */}
                  {isFirst && article.excerpt && (
                    <p className="line-clamp-3 leading-relaxed text-muted-foreground">{article.excerpt}</p>
                  )}
                </Link>
              </article>
            );
          })}
        </div>


        {/* Right Column: Sidebar (25%) */}
        <div className="flex flex-col gap-6 border-l border-border/20 lg:col-span-3 lg:border-l">
          {/* Live Tv Widgets */}
          {process.env.NEXT_PUBLIC_LIVE_TV_ENABLED && (
            <article className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-red-600">Live TV</h4>
                </div>
              </div>
              <LiveTvPlayer />
            </article>
          )}

          {/* List Items */}
          <div className="flex flex-col gap-6">
            {rightListMostViewed.map((item) => (
              <article key={item.id}>
                <Link href={`/news/${item.slug}`} className="group grid grid-cols-3 gap-4 hover:text-red-500">
                  <div className="col-span-2">
                    <h4 className="font-serif text-sm font-bold leading-snug ">{item.title}</h4>
                  </div>
                  <div className="col-span-1">
                    <OptimizedArticleImage
                      src={item.image || "/assets/newsplaceholder.webp"}
                      alt={item.title}
                      videoUrl={item.video}
                      sizes="(max-width: 768px) 100vw, 8vw"
                      aspectRatio="square"
                      className="rounded-sm"
                      imageClassName="group-hover:scale-105"
                    />
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import SectionHeader from "../SectionHeader"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import dynamic from "next/dynamic"

const MultiCityWeather = dynamic(() => import("@/components/widgets/multi-city-weather").then(mod => mod.MultiCityWeather), {
  loading: () => <div className="w-full h-64 bg-muted/10 animate-pulse rounded-sm" />
})

interface Article {
  id: string
  title: string
  excerpt?: string
  image?: string
  category?: string
  date?: string
  author?: string
}

interface SidebarItem {
  id: string
  title: string
  image: string
  author?: string
}

interface ContentSidebarSectionProps {
  topHeadlines?: Article[]
  featuredArticle?: Article & { isVideo?: boolean }
  jharkhandBottom?: Article[]
  stateArticles?: Article[]
  moreNewsArticles?: Article[]
  sidebarTopArticle?: SidebarItem
  sidebarColumns?: SidebarItem[]
  sidebarOpinion?: { left: Article[]; right: Article[] }
}

export function ContentSidebarSection({
  topHeadlines = [],
  featuredArticle,
  jharkhandBottom = [],
  stateArticles = [],
  moreNewsArticles = [],
  sidebarTopArticle,
  sidebarColumns = [],
  sidebarOpinion,
}: ContentSidebarSectionProps) {
  const jharkhandSupporting = topHeadlines.slice(0, 4)
  const biharPrimary = stateArticles.slice(0, 12)
  const biharSecondary = moreNewsArticles.slice(0, 6)

  // Check if there is any content to render
  const hasMainContent = featuredArticle || jharkhandSupporting.length > 0 || biharPrimary.length > 0;
  const hasSidebar = sidebarTopArticle || sidebarColumns.length > 0;

  if (!hasMainContent && !hasSidebar) {
    return null;
  }

  return (
    <div className="w-full border-t-2 border-black mb-6 feature-section-font">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Main Content Area - 75% on desktop */}
          <div className="w-full lg:w-[calc(75%-2.5rem)] space-y-10 ">
            {/* Featured Article with Video */}
            {featuredArticle && (
              <div className="pb-8 border-b border-border/50">
                {/* Category Badge */}
                <SectionHeader title="झारखंड" href="/category/jharkhand" />

                <article>
                  {/* Featured Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* Left: Title and Text */}
                    <div className="lg:col-span-4 space-y-5">
                      <Link href={`/news/${featuredArticle.id}`} className="group transition-colors hover:text-red-500">
                        <h2 className="leading-tight transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-4" title={featuredArticle.title}>
                          {featuredArticle.title}
                        </h2>
                      </Link>

                      {/* Author and Date */}
                      {featuredArticle.author && featuredArticle.date && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          <span>By</span>
                          <span className="text-foreground">
                            {featuredArticle.author}
                          </span>
                          <span>—</span>
                          <time>{featuredArticle.date}</time>
                        </div>
                      )}

                      {/* Excerpt */}
                      {featuredArticle.excerpt && (
                        <p className="feature-section-description hindi-clamp hindi-clamp-4">{featuredArticle.excerpt}</p>
                      )}
                    </div>

                    {/* Right: Video/Image */}
                    <div className="lg:col-span-8">
                      <Link href={`/news/${featuredArticle.id}`} className="group block overflow-hidden rounded-sm hover:shadow-lg transition-all">
                        <OptimizedArticleImage
                          src={featuredArticle.image || "/assets/newsplaceholder.webp"}
                          alt={featuredArticle.title}
                          videoUrl={featuredArticle.isVideo ? featuredArticle.image : undefined}
                          priority
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          aspectRatio="video"
                          className="w-full h-full"
                          imageClassName="transition-transform duration-500 group-hover:scale-105"
                          showPlayButton={featuredArticle.isVideo}
                        />
                      </Link>
                    </div>
                  </div>
                </article>

                {jharkhandSupporting.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-border/50">
                    {jharkhandSupporting.map((article) => (
                      <article key={article.id} className="group">
                        <Link href={`/news/${article.id}`} className="block transition-colors hover:text-red-600">
                          <h3 className="headlines-title hindi-clamp hindi-clamp-3 transition-colors group-hover:text-red-600">
                            {article.title}
                          </h3>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {/* Jharkhand Bottom News (Image + Title) */}
                {jharkhandBottom && jharkhandBottom.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {jharkhandBottom.map((article) => (
                        <article key={article.id} className="group flex gap-4">
                          <Link href={`/news/${article.id}`} className="relative w-28 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-muted shadow-sm group-hover:shadow-md transition-all">
                            <OptimizedArticleImage
                              src={article.image || "/assets/newsplaceholder.webp"}
                              alt={article.title}
                              priority
                              sizes="120px"
                              aspectRatio="16/9"
                              className="w-full h-full"
                              imageClassName="transition-transform duration-500 group-hover:scale-110" />
                          </Link>
                          <div className="flex flex-col justify-center">
                            <Link href={`/news/${article.id}`} className="transition-colors hover:text-red-600">
                              <h3 className="headlines-title hindi-clamp hindi-clamp-3 group-hover:text-red-600" title={article.title}>
                                {article.title}
                              </h3>
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Politics and More News - Two Column Layout */}
            {(biharPrimary.length > 0 || biharSecondary.length > 0) && (
              <section className="space-y-6">
                <SectionHeader title="बिहार" href="/category/bihar" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {biharPrimary.length > 0 && (
                    <div className="space-y-5">
                      {biharPrimary.map((article) => (
                        <article key={article.id} className="group flex gap-4 py-1">
                          <Link href={`/news/${article.id}`} className="flex-shrink-0 w-28 h-20 overflow-hidden rounded-sm bg-muted shadow-sm group-hover:shadow-md transition-all">
                            <OptimizedArticleImage
                              src={article.image || "/assets/newsplaceholder.webp"}
                              alt={article.title}
                              sizes="120px"
                              aspectRatio="3/2"
                              className="w-full h-full"
                              imageClassName="transition-transform duration-500 group-hover:scale-110"
                            />
                          </Link>
                          <Link href={`/news/${article.id}`} className="flex-1 transition-colors hover:text-red-600">
                            <h3 className="content-title hindi-clamp hindi-clamp-3 group-hover:text-red-600" title={article.title}>
                              {article.title}
                            </h3>
                          </Link>
                        </article>
                      ))}
                    </div>
                  )}

                  {biharSecondary.length > 0 && (
                    <div className="space-y-8 border-l border-border/50 lg:pl-8">
                      {biharSecondary.map((article, index) => (
                        <article key={article.id} className="group pb-6 last:pb-0 border-b border-border/30 last:border-0">
                          {index === 0 && article.image ? (
                            <div className="space-y-5">
                              <Link href={`/news/${article.id}`} className="block transition-colors hover:text-red-600">
                                <h1 className="leading-tight group-hover:text-red-600 hindi-clamp hindi-clamp-4" title={article.title}>
                                  {article.title}
                                </h1>
                              </Link>
                              <Link href={`/news/${article.id}`} className="block overflow-hidden rounded-sm shadow-md group-hover:shadow-lg transition-all">
                                <OptimizedArticleImage
                                  src={article.image || "/assets/newsplaceholder.webp"}
                                  alt={article.title}
                                  sizes="(max-width: 1024px) 100vw, 40vw"
                                  aspectRatio="video"
                                  className="w-full h-full"
                                  imageClassName="transition-transform duration-500 group-hover:scale-105"
                                />
                              </Link>
                              {article.excerpt && (
                                <p className="feature-section-description hindi-clamp hindi-clamp-3">{article.excerpt}</p>
                              )}
                            </div>
                          ) : (
                            <Link href={`/news/${article.id}`} className="block transition-colors hover:text-red-600">
                              <h3 className="content-title hindi-clamp hindi-clamp-3 transition-colors group-hover:text-red-600" title={article.title}>
                                {article.title}
                              </h3>
                            </Link>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <span className="hidden lg:block border-r border-border/50" />

          {/* Sidebar - 25% on desktop */}
          <aside className="w-full lg:w-[calc(25%-1.5rem)] space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* Top Featured Sidebar Article with Circular Image */}
            {sidebarTopArticle && (
              <div className="pb-8 border-b border-border/50">
                <article className="space-y-4">
                  <Link href={`/news/${sidebarTopArticle.id}`} className="group block overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-all">
                    <OptimizedArticleImage
                      src={sidebarTopArticle.image || "/assets/newsplaceholder.webp"}
                      alt={sidebarTopArticle.title}
                      sizes="(max-width: 1024px) 100vw, 25vw"
                      aspectRatio="3/2"
                      className="w-full h-full"
                      imageClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="text-left">
                    <Link href={`/news/${sidebarTopArticle.id}`} className="group block transition-colors hover:text-red-600">
                      <span className="content-title leading-snug transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-4" title={sidebarTopArticle.title}>
                        {sidebarTopArticle.title}
                      </span>
                    </Link>
                    {sidebarTopArticle.author && (
                      <p className="text-xs text-muted-foreground mt-3 font-medium uppercase tracking-wider">
                        By{" "}
                        <span className="text-foreground">
                          {sidebarTopArticle.author}
                        </span>
                      </p>
                    )}
                  </div>
                </article>
              </div>
            )}

            {/* Columns Section */}
            {sidebarColumns.length > 0 && (
              <section className="pb-8 border-b border-border/50">
                <div className="space-y-6">
                  {sidebarColumns.slice(0, 5).map((item) => (
                    <article key={item.id} className="group flex gap-3 items-start">
                      <div className="flex-1 min-w-0">
                        <Link href={`/news/${item.id}`} className="block transition-colors hover:text-red-600">
                          <span className="headlines-title hindi-clamp hindi-clamp-3 transition-colors group-hover:text-red-600" title={item.title}>
                            {item.title}
                          </span>
                        </Link>
                        {item.author && (
                          <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
                            By{" "}
                            <span className="text-foreground">{item.author}</span>
                          </p>
                        )}
                      </div>
                      <Link href={`/news/${item.id}`} className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-sm shadow-sm group-hover:shadow-md transition-all">
                        <OptimizedArticleImage
                          src={item.image || "/assets/newsplaceholder.webp"}
                          alt={item.title}
                          sizes="80px"
                          aspectRatio="square"
                          className="w-full h-full"
                          imageClassName="transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Opinion Section - 2 Column Grid */}
            {sidebarOpinion && (
              <section className="pb-10 border-b border-border/50">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {sidebarOpinion.left.map((article) => (
                      <article key={article.id} className="group">
                        <Link href={`/news/${article.id}`} className="block transition-colors hover:text-red-600">
                          <span className="hindi-clamp hindi-clamp-3 text-sm transition-colors group-hover:text-red-600" title={article.title}>
                            {article.title}
                          </span>
                        </Link>
                      </article>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="space-y-6">
                    {sidebarOpinion.right.map((article) => (
                      <article key={article.id} className="group">
                        <Link href={`/news/${article.id}`} className="block transition-colors hover:text-red-600">
                          <span className="hindi-clamp hindi-clamp-3 text-sm transition-colors group-hover:text-red-600" title={article.title}>
                            {article.title}
                          </span>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Weather Widget */}
            <div className="sticky top-24">
              <MultiCityWeather />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link"
import SectionHeader from "../SectionHeader"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"

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
    <div className="w-full border-t-2 border-black mb-6">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-6">
          {/* Main Content Area - 80% on desktop */}
          <div className="w-full lg:w-[calc(75%-1.5rem)] space-y-8 ">
            {/* Featured Article with Video */}
            {featuredArticle && (
              <div className="pb-6 border-b-2 border-border">
                {/* Category Badge */}
                <SectionHeader title="झारखंड" />

                <article>
                  {/* Featured Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Left: Title and Text */}
                    <div className="lg:col-span-4 space-y-4">
                      <Link href={`/news/${featuredArticle.id}`} className="group hover:text-red-500">
                        <h1 className="content-title leading-tight transition-colors duration-200">
                          {featuredArticle.title}
                        </h1>
                      </Link>

                      {/* Author and Date */}
                      {featuredArticle.author && featuredArticle.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>By</span>
                          <span className="font-semibold text-foreground uppercase tracking-wide">
                            {featuredArticle.author}
                          </span>
                          <span>—</span>
                          <time className="text-muted-foreground">{featuredArticle.date}</time>
                        </div>
                      )}

                      {/* Excerpt */}
                      {featuredArticle.excerpt && (
                        <p className="text-muted-foreground leading-relaxed">{featuredArticle.excerpt}</p>
                      )}
                    </div>

                    {/* Right: Video/Image */}
                    <div className="lg:col-span-8">
                      <Link href={`/news/${featuredArticle.id}`} className="group block hover:text-red-500">
                        <OptimizedArticleImage
                          src={featuredArticle.image || "/placeholder.svg?height=600&width=1200"}
                          alt={featuredArticle.title}
                          videoUrl={featuredArticle.isVideo ? featuredArticle.image : undefined}
                          priority
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          aspectRatio="video"
                          className="rounded-sm"
                          imageClassName="group-hover:scale-105"
                          showPlayButton={featuredArticle.isVideo}
                        />
                      </Link>
                    </div>
                  </div>
                </article>

                {jharkhandSupporting.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-border">
                    {jharkhandSupporting.map((article) => (
                      <article key={article.id}>
                        <Link href={`/news/${article.id}`} className="group block hover:text-red-500 ">
                          <h3 className="headlines-title transition-colors duration-200 group-hover:text-primary hover:font-semibold">
                            {article.title}
                          </h3>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {/* Jharkhand Bottom News (Image + Title) */}
                {jharkhandBottom && jharkhandBottom.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {jharkhandBottom.map((article) => (
                        <article key={article.id}>
                          <Link href={`/news/${article.id}`} className="group flex gap-4 hover:text-red-500">
                            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                              <OptimizedArticleImage
                                src={article.image || "/placeholder.svg?height=96&width=96"}
                                alt={article.title}
                                priority
                                sizes="(max-width: 768px) 100vw, 60vw"
                                aspectRatio="16/9"
                                imageClassName="group-hover:scale-105" />
                            </div>
                            <div className="flex flex-col justify-center">
                              <h4 className="text-sm font-medium line-clamp-3 leading-snug group-hover:text-red-500 transition-colors">
                                {article.title}
                              </h4>
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Politics and More News - Two Column Layout */}
            {(biharPrimary.length > 0 || biharSecondary.length > 0) && (
              <section>
                <SectionHeader title="बिहार" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-6">
                  {biharPrimary.length > 0 && (
                    <div className="space-y-4">
                      {biharPrimary.map((article) => (
                        <article key={article.id} className="flex gap-4 group cursor-pointer items-center">
                          <Link href={`/news/${article.id}`} className="group hover:font-semi-bold flex-shrink-0 w-24 h-16">
                            <OptimizedArticleImage
                              src={article.image || "/placeholder.svg?height=600&width=1200"}
                              alt={article.title}
                              sizes="96px"
                              aspectRatio="3/2"
                              className="rounded"
                              imageClassName="group-hover:scale-110"
                            />
                          </Link>
                          <Link href={`/news/${article.id}`} className="group ">
                            <h4 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                              {article.title}
                            </h4>
                          </Link>
                        </article>
                      ))}
                    </div>
                  )}

                  {biharSecondary.length > 0 && (
                    <div className="space-y-4 border-l border-border lg:pl-6">
                      {biharSecondary.map((article, index) => (
                        <article key={article.id} className="pb-4 last:pb-0 border-border">
                          {index === 0 && article.image ? (
                            <div className="space-y-4">
                              <Link href={`/news/${article.id}`} className="group hover:text-red-600">
                                <h3 className="font-serif text-xl lg:text-2xl font-bold leading-tight text-foreground transition-colors duration-200">
                                  {article.title}
                                </h3>
                              </Link>
                              <Link href={`/news/${article.id}`} className="group block">
                                <OptimizedArticleImage
                                  src={article.image || "/placeholder.svg?height=600&width=1200"}
                                  alt={article.title}
                                  sizes="(max-width: 1024px) 100vw, 40vw"
                                  aspectRatio="video"
                                  className="rounded-sm"
                                  imageClassName="group-hover:scale-105"
                                />
                              </Link>
                              {article.excerpt && (
                                <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
                              )}
                            </div>
                          ) : (
                            <Link href={`/news/${article.id}`} className="group block">
                              <h4 className="headlines-sub-title leading-tight text-foreground group-hover:text-red-600 transition-colors duration-200">
                                {article.title}
                              </h4>
                            </Link>
                          )}
                          {index < biharSecondary.length - 1 && <div className="mt-4 border-b border-border" />}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
          <span className="border-r " />
          {/* Sidebar - 20% on desktop */}
          <aside className="w-full lg:w-[calc(25%-1.5rem)] space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Top Featured Sidebar Article with Circular Image */}
            {sidebarTopArticle && (
              <div className="pb-6 border-b border-border">
                <article className="space-y-5">
                  <Link href={`/news/${sidebarTopArticle.id}`} className="group block">
                    <OptimizedArticleImage
                      src={sidebarTopArticle.image || "/placeholder.svg?height=600&width=1200"}
                      alt={sidebarTopArticle.title}
                      sizes="200px"
                      aspectRatio="3/2"
                      className="mb-2 rounded-sm"
                      imageClassName="group-hover:scale-105"
                    />
                  </Link>
                  <div className="text-center lg:text-left">
                    <Link href={`/news/${sidebarTopArticle.id}`} className="group hover:text-red-600">
                      <h3 className="feature-section-font duration-200">
                        {sidebarTopArticle.title}
                      </h3>
                    </Link>
                    {sidebarTopArticle.author && (
                      <p className="text-xs text-muted-foreground mt-3">
                        By{" "}
                        <span className="font-semibold text-foreground uppercase tracking-wide">
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
              <section className="pb-6 border-b border-border">

                <div className="space-y-8">
                  {sidebarColumns.slice(0, 5).map((item) => (
                    <article key={item.id} className="flex gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <Link href={`/news/${item.id}`} className="group hover:text-red-600">
                          <h4 className="expert transition-colors duration-200">
                            {item.title}
                          </h4>
                        </Link>
                        {item.author && (
                          <p className="text-xs text-muted-foreground mt-2">
                            By{" "}
                            <span className="font-semibold text-foreground uppercase tracking-wide">{item.author}</span>
                          </p>
                        )}
                      </div>
                      <Link href={`/news/${item.id}`} className="group flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24">
                        <OptimizedArticleImage
                          src={item.image || "/placeholder.svg?height=600&width=1200"}
                          alt={item.title}
                          sizes="96px"
                          aspectRatio="square"
                          className="rounded"
                          imageClassName="group-hover:scale-110"
                        />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Opinion Section - 2 Column Grid */}
            {sidebarOpinion && (
              <section className="pb-10 border-b border-border">

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {sidebarOpinion.left.map((article) => (
                      <article key={article.id}>
                        <Link href={`/news/${article.id}`} className="group ">
                          <h4 className="font-serif text-sm lg:text-base font-bold leading-tight text-foreground group-hover:text-red-600 transition-colors duration-200">
                            {article.title}
                          </h4>
                        </Link>
                      </article>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="space-y-6">
                    {sidebarOpinion.right.map((article) => (
                      <article key={article.id}>
                        <Link href={`/news/${article.id}`} className="group">
                          <h4 className="font-serif text-sm lg:text-base font-bold leading-tight text-foreground group-hover:text-red-600 transition-colors duration-200">
                            {article.title}
                          </h4>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Advertisement Space - SMARTMAG */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-8 lg:p-10 text-white text-center shadow-xl">
              <div className="relative z-10 space-y-6">
                <p className="text-xs font-bold uppercase tracking-widest opacity-90">The New</p>
                <h3 className="text-4xl lg:text-5xl font-bold tracking-tight">Bawal News</h3>
                <p className="text-sm opacity-90 max-w-[200px] mx-auto">
                  Trusted by over <span className="font-bold">10000</span> users worldwide
                </p>
                <button className="inline-block bg-white text-red-600 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  Get Started
                </button>
              </div>
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import Image from "next/image"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdSidebar } from "@/components/ads/ad-sidebar"
import { getNewsByCategory, getMostViewedNews } from "@/lib/services/news-api.service"
import { getCachedPublicCategories } from "@/lib/services/news-api.service"
import { mapToArticle } from "@/lib/utils/news-mapper-unified"
import type { NewsResponse } from "@/lib/services/news-api.service"
import type { Article } from "@/constants/news-data"

// This is a server component that fetches its own data
export async function ArticleSidebar() {
  // Fetch economy/business news dynamically
  const economyResult = await getNewsByCategory(
    { slug: "business", includeChildren: false },
    { limit: 2, includeAuthor: true, includeCategories: true, includeContent: false }
  ).catch(async () => {
    // Fallback to economy category if business doesn't exist
    return await getNewsByCategory(
      { slug: "economy", includeChildren: false },
      { limit: 2, includeAuthor: true, includeCategories: true, includeContent: false }
    ).catch(() => ({ data: [], pagination: { page: 1, limit: 2, total: 0, totalPages: 0, hasNext: false, hasPrev: false } }))
  })

  // Fetch trending news (most viewed from last 7 days)
  const trendingNews = await getMostViewedNews({
    limit: 5,
    days: 7,
    includeAuthor: true,
    includeCategories: true,
    includeContent: false,
  }).catch(() => [])

  // Get public categories dynamically
  const categories = await getCachedPublicCategories().catch(() => [])

  // Map news to Article format
  const economyNews: Article[] = economyResult.data.map((news: NewsResponse) => mapToArticle(news))
  const trendingArticles: Article[] = trendingNews.map((news: NewsResponse) => mapToArticle(news))

  return (
    <div className="space-y-8">
      {/* Live Score Widget */}
      {/* <LiveScoreWidget /> */}

      {/* Ad Block 1 - Dynamic Sidebar Ad (Position 0) */}
      <AdSidebar position={0} showDefault={true} />

      {/* Featured Topics Widget - Dynamic Categories */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
          <span>Featured Topics</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.slice(0, 8).map((category: any) => (
              <Link key={category.slug} href={`/${category.slug}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-orange-100 hover:text-[#FF6B35] cursor-pointer px-3 py-1 rounded-md transition-all capitalize"
                >
                  {category.name}
                </Badge>
              </Link>
            ))
          ) : (
            // Fallback to default categories if API fails
            ["politics", "sports", "technology", "business", "entertainment", "health", "world", "local"].map((tag) => (
              <Link key={tag} href={`/${tag}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-orange-100 hover:text-[#FF6B35] cursor-pointer px-3 py-1 rounded-md transition-all capitalize"
                >
                  {tag}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Economy News Widget - Dynamic */}
      {economyNews.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-lg text-[#FF6B35] uppercase">Economy News</h3>
          </div>
          <div className="p-4 space-y-6">
            {economyNews.map((news) => (
              <div key={news.id} className="group">
                <Link href={`/news/${news.slug}`}>
                  <div className="relative aspect-video w-full mb-3 rounded-md overflow-hidden">
                    <Image
                      src={news.image || "/assets/newsplaceholder.webp"}
                      alt={news.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-[#FF6B35] hover:bg-[#E55A2B] text-[10px] h-5">YOU JOINED US</Badge>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
                    {news.title}
                  </h4>
                </Link>
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <span className="uppercase font-semibold mr-2">BY {news.author}</span>
                  <span>— {news.date}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{news.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Trending Widget - Dynamic */}
      {trendingArticles.length > 0 && (
        <div className="border-t-4 border-[#FF6B35] pt-4">
          <h3 className="font-bold text-lg mb-6 flex items-center">
            <Badge variant="secondary" className="bg-orange-100 text-[#FF6B35] hover:bg-orange-200 rounded-sm uppercase mr-2">
              TOP TRENDING
            </Badge>
          </h3>
          <div className="space-y-6">
            {trendingArticles.map((news, index) => (
              <div key={news.id} className="group">
                {index === 0 ? (
                  <Link href={`/news/${news.slug}`} className="block mb-4">
                    <div className="relative aspect-video w-full mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={news.image || "/assets/newsplaceholder.webp"}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  </Link>
                ) : null}

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <span className="text-3xl font-bold text-[#FF6B35]/50 leading-none">{index + 1}.</span>
                  </div>
                  <div>
                    <Link href={`/news/${news.slug}`}>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      <span className="uppercase font-semibold">By {news.author}</span>
                      <span className="mx-1">—</span>
                      <span>{news.date}</span>
                    </div>
                    {index === 0 && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{news.excerpt}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Widget */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg p-6 text-center">
        <Mail className="h-10 w-10 mx-auto mb-4 text-foreground" />
        <h3 className="font-bold text-xl mb-2">Subscribe to News</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Get the latest sports news from NewsSite about world, sports and politics.
        </p>
        <div className="space-y-3">
          <Input placeholder="Your email address.." className="bg-background" />
          <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold uppercase">Subscribe</Button>
        </div>
        <div className="mt-4 flex items-start gap-2 text-left">
          <input type="checkbox" id="terms" className="mt-1" />
          <label htmlFor="terms" className="text-xs text-muted-foreground">
            By signing up, you agree to the our terms and our Privacy Policy agreement.
          </label>
        </div>
      </div>

      {/* Ad Block 2 - Dynamic Sidebar Ad (Position 1) */}
      <AdSidebar position={1} showDefault={true} />
    </div>
  )
}

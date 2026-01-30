import { FeaturedSection } from "./featured-section"
import { ContentSidebarSection } from "./content-sidebar-section"
import { getCombinedHomeData } from "@/lib/actions/home-data"
import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker/breaking-news-ticker"
import { ChevronRight, Link } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic imports for performance (Below the fold content)
const Ads = dynamic(() => import("@/components/ads/page"), {
  loading: () => <div className="w-full h-32 bg-muted/10 animate-pulse my-8" />
})

const CategoryNewsSection = dynamic(() => import("./category-news-section").then(mod => mod.CategoryNewsSection), {
  loading: () => <div className="w-full h-[800px] bg-muted/5 animate-pulse my-8" />
})

const OneSection = dynamic(() => import("./section-one").then(mod => mod.OneSection), {
  loading: () => <div className="w-full h-[400px] bg-muted/5 animate-pulse my-8" />
})

export default async function Home() {
  // Fetch all data server-side in parallel
  // getCombinedHomeData fetches ALL data including featured, sidebar, technology AND category sections
  // with global deduplication logic
  const combinedData = await getCombinedHomeData();

  const { featuredData, contentSidebarData, technologyData, categorySectionData } = combinedData;

  // Get breaking news for ticker (after 5th post, so skip first 5 breaking news items)
  const tickerNews = featuredData.breakingNews.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
  }))

  return (
    <div className="space-y-4 feature-section-font md:px-0 px-1 ">
      {/* BREAKING NEWS TICKER - After 5th post (featured section) */}
      {tickerNews.length > 0 && (
        <BreakingNewsTicker news={tickerNews} />
      )}

      {/* FEATURED SECTION - Static for LCP Optimization */}
      <FeaturedSection
        mainFeatured={featuredData.mainFeatured}
        middleFeatured={featuredData.middleFeatured}
        rightTopFeatured={featuredData.rightTopFeatured}
        rightListMostViewed={featuredData.rightListMostViewed}
        breakingNews={featuredData.breakingNews}
      />

      {/* Trending Topics Bar */}
      {/* <div className="my-6 flex items-center gap-4 overflow-hidden border-y border-border/50 py-3">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold uppercase tracking-tight text-red-600">Trending</span>
        </div>
        <div className="flex flex-1 gap-4 overflow-x-auto no-scrollbar">
          {featuredData.breakingNews.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-xs font-medium transition-colors hover:border-red-500 hover:bg-red-50"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div> */}

      {/* STATE SECTION - Static (Important Content) */}
      <ContentSidebarSection
        topHeadlines={contentSidebarData.topHeadlines}
        featuredArticle={contentSidebarData.featuredArticle}
        jharkhandBottom={contentSidebarData.jharkhandBottom}
        stateArticles={contentSidebarData.stateArticles}
        moreNewsArticles={contentSidebarData.moreNewsArticles}
        sidebarTopArticle={contentSidebarData.sidebarTopArticle}
        sidebarColumns={contentSidebarData.sidebarColumns}
        sidebarOpinion={contentSidebarData.sidebarOpinion}
      />

      {/* Middle ADS - Dynamic */}
      <Ads />

      {/* CATEGORY SECTIONS - Dynamic (Heavy Listing) */}
      <CategoryNewsSection
        politics={categorySectionData.politics}
        sports={categorySectionData.sports}
        entertainment={categorySectionData.entertainment}
        crime={categorySectionData.crime}
        topTrending={categorySectionData.topTrending}
        exclusiveNews={categorySectionData.exclusiveNews}
        sidebarBottom={categorySectionData.sidebarBottom}
      />

      {/* TECHNOLOGY SECTION - Dynamic */}
      <OneSection
        categoryName={technologyData.categoryName}
        featuredArticle={technologyData.featuredArticle}
        sideArticles={technologyData.sideArticles}
        rightArticles={technologyData.rightArticles}
      />
    </div>
  )
}

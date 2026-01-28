import { FeaturedSection } from "./featured-section"
import { ContentSidebarSection } from "./content-sidebar-section"
import { CategoryNewsSection } from "./category-news-section"
import { OneSection } from "./section-one"
import Ads from "@/components/ads/page"
import { getCombinedHomeData } from "@/lib/actions/home-data"
import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker/breaking-news-ticker"

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
    <div className="space-y-6 feature-section-font md:px-0 px-1 ">
      {/* BREAKING NEWS TICKER - After 5th post (featured section) */}
      {tickerNews.length > 0 && (
        <BreakingNewsTicker news={tickerNews} />
      )}

      {/* FEATURED SECTION - Now using dynamic data */}
      <FeaturedSection
        mainFeatured={featuredData.mainFeatured}
        middleFeatured={featuredData.middleFeatured}
        rightTopFeatured={featuredData.rightTopFeatured}
        rightListMostViewed={featuredData.rightListMostViewed}
        breakingNews={featuredData.breakingNews}
      />



      {/* STATE SECTION - Now using dynamic data */}
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


      {/* ADS */}
      <Ads />
      {/* CONTENT SIDEBAR SECTION */}

      <CategoryNewsSection
        politics={categorySectionData.politics}
        sports={categorySectionData.sports}
        entertainment={categorySectionData.entertainment}
        crime={categorySectionData.crime}
        topTrending={categorySectionData.topTrending}
        exclusiveNews={categorySectionData.exclusiveNews}
        sidebarBottom={categorySectionData.sidebarBottom}
      />

      {/* TECHNOLOGY SECTION - Now using dynamic data */}
      <OneSection
        categoryName={technologyData.categoryName}
        featuredArticle={technologyData.featuredArticle}
        sideArticles={technologyData.sideArticles}
        rightArticles={technologyData.rightArticles}
      />
    </div>
  )
}

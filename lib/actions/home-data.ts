/**
 * Home Page Data Fetching
 * Server-side data fetching for home page with SSR optimization
 * 
 * ARCHITECTURE OVERVIEW:
 * 1. Configuration: Centralized constants for limits and slugs
 * 2. Deduplicator: Utility class to track and filter unique articles globally
 * 3. Processors: Modular functions to handle specific section logic
 * 4. Main Function: Orchestrates fetching and processing
 */

import { cache } from "react";
import {
  getCachedFeaturedNews,
  getCachedBreakingNews,
  getCachedMostViewedNews,
  getNewsByCategory,
  type NewsResponse
} from "@/lib/services/news-api.service";
import {
  // Unified Mapper Functions
  mapToContentSidebarArticle,
  mapToSidebarItem,
  mapToSectionOneArticle,
  mapToSectionOneSmallArticle,
  // Batch Mapper Functions
  mapArrayToFeaturedArticles,
  mapArrayToContentSidebarArticles,
  mapArrayToSidebarItems,
  mapArrayToSectionOneArticles,
  mapArrayToSectionOneSmallArticles,
  // Types
  type ContentSidebarArticle,
  type ContentSidebarSidebarItem,
  type SectionOneArticle,
  type SectionOneSmallArticle,
} from "@/lib/utils/news-mapper-unified";
import {
  mapToCategoryBlockTypeA,
  mapToCategoryBlockTypeB,
  mapArrayToTopTrendingItems,
  mapArrayToExclusiveNewsItems,
  mapArrayToSidebarSmallListItems,
  type CategoryBlockTypeAData,
  type CategoryBlockTypeBData,
  type TopTrendingItem,
  type ExclusiveNewsItem,
  type SidebarSmallListItem,
} from "@/lib/utils/category-section-mapper";

// ============================================================================
// 1. CONFIGURATION
// ============================================================================

const HOME_DATA_CONFIG = {
  // Fetch Limits (Increased to ensure robust deduplication pool)
  limits: {
    featured: 80, // Increased for fallback pool
    breaking: 20,
    mostViewed: 20,
    sidebarState: 30,
    sidebarJhk: 20,
    sidebarNational: 20,
    technology: 20,
    politics: 30,
    categoryGeneric: 40,
    entertainment: 25,
  },
  // Category Slugs
  slugs: {
    jharkhand: "jharkhand",
    bihar: "bihar",
    national: "national",
    technology: ["technology", "tech", "technologies"],
    politics: "politics",
    sports: "sports",
    entertainment: "entertainment",
    crime: "crime",
  },
  // Fallback Titles
  titles: {
    technology: "TECHNOLOGY",
    politics: "राजनीति",
    sports: "खेल",
    entertainment: "मनोरंजन",
    crime: "क्राइम",
  }
} as const;

// ============================================================================
// 2. NEWS DEDUPLICATOR UTILITY
// ============================================================================

class NewsDeduplicator {
  private usedIds = new Set<string>();

  /**
   * Add an item ID to the used set
   */
  public add(id: string): void {
    if (id) this.usedIds.add(id);
  }

  /**
   * Check if an item ID has already been used
   */
  public has(id: string): boolean {
    if (!id) return false; // Ignore empty IDs
    return this.usedIds.has(id);
  }

  /**
   * Return a list of unique items from the source array.
   * Automatically marks returned items as used.
   */
  public getUnique<T extends { id: string; slug?: string }>(items: T[], count: number): T[] {
    const uniqueItems: T[] = [];

    for (const item of items) {
      if (uniqueItems.length >= count) break;

      // Check both ID and Slug to be safe
      const isUsed = this.has(item.id) || (item.slug && this.has(item.slug)) || false;

      if (!isUsed) {
        uniqueItems.push(item);
        this.add(item.id);
        if (item.slug) this.add(item.slug);
      }
    }

    return uniqueItems;
  }

  /**
   * Return unique items from source items based on NewsResponse
   * Specific handler for raw NewsResponse (checking id and slug)
   */
  public getUniqueRaw(items: NewsResponse[], count: number): NewsResponse[] {
    const uniqueItems: NewsResponse[] = [];

    for (const item of items) {
      if (uniqueItems.length >= count) break;

      if (!this.has(item.id) && !this.has(item.slug)) {
        uniqueItems.push(item);
        this.add(item.id);
        this.add(item.slug);
      }
    }

    return uniqueItems;
  }
}

// ============================================================================
// 3. PROCESSOR FUNCTIONS
// ============================================================================

/**
 * Process Featured Section
 * (Main Featured, Middle Featured, Right Column, Breaking News)
 */
function processFeaturedSection(
  featuredRaw: NewsResponse[],
  mostViewedRaw: NewsResponse[],
  breakingRaw: NewsResponse[],
  deduplicator: NewsDeduplicator
) {
  // Prep Mapped Data
  const featuredAll = mapArrayToFeaturedArticles(featuredRaw);
  const mostViewedAll = mapArrayToFeaturedArticles(mostViewedRaw);
  const breakingAll = mapArrayToFeaturedArticles(breakingRaw);

  // 1a. Main & Middle (Priority 1)
  const featuredPool = deduplicator.getUnique(featuredAll, 4); // 1 Main + 3 Middle
  const mainFeatured = featuredPool[0] || null;
  const middleFeatured = featuredPool.slice(1, 4);

  // 1b. Right Column (Most Viewed)
  const mostViewedPool = deduplicator.getUnique(mostViewedAll, 4); // 1 Top + 3 List
  const rightTopFeatured = mostViewedPool[0] || null;
  const rightListMostViewed = mostViewedPool.slice(1, 4);

  // 1c. Breaking News
  const breakingNews = deduplicator.getUnique(breakingAll, 12);

  return {
    mainFeatured,
    middleFeatured,
    rightTopFeatured,
    rightListMostViewed,
    breakingNews,
  };
}

/**
 * Process Content Sidebar Section
 * (Headlines, State News, Sidebar Columns)
 */
function processContentSidebar(
  jharkhandRaw: NewsResponse[],
  biharRaw: NewsResponse[],
  nationalRaw: NewsResponse[],
  featuredRaw: NewsResponse[], // Fallback pool
  deduplicator: NewsDeduplicator
) {
  // Mapped Data
  const jharkhandAll = mapArrayToContentSidebarArticles(jharkhandRaw);
  const biharAll = mapArrayToContentSidebarArticles(biharRaw);
  const nationalAll = mapArrayToContentSidebarArticles(nationalRaw);

  // Featured pool for fallbacks
  const featuredSidebarPool = mapArrayToContentSidebarArticles(featuredRaw);

  // 2a. Featured Article (Jharkhand > National > Featured)
  let featuredArticle: ContentSidebarArticle | undefined;

  // Try Jharkhand first
  const jhkCandidates = deduplicator.getUnique(jharkhandAll, 1);
  if (jhkCandidates.length > 0) {
    featuredArticle = jhkCandidates[0];
  } else {
    // Try National if no Jharkhand
    const natCandidates = deduplicator.getUnique(nationalAll, 1);
    if (natCandidates.length > 0) {
      featuredArticle = natCandidates[0];
    } else {
      // Last Fallback: Featured
      const featCandidates = deduplicator.getUnique(featuredSidebarPool, 1);
      if (featCandidates.length > 0) {
        featuredArticle = featCandidates[0];
      }
    }
  }

  // 2b. Top Headlines (Jharkhand)
  let topHeadlines = deduplicator.getUnique(jharkhandAll, 4);

  // 2c. Jharkhand Bottom (6 items)
  let jharkhandBottom = deduplicator.getUnique(jharkhandAll, 6);

  // 2d. State Articles (Bihar) - Strict 12 or less
  const stateArticles = deduplicator.getUnique(biharAll, 12);

  // 2d. More News (Bihar > National)
  let moreNewsArticles = deduplicator.getUnique(biharAll, 6);
  // If we run out of Bihar news for "More News", we can fill with National safely
  // because this is a "More News" section, not strict state section
  if (moreNewsArticles.length < 6) {
    const needed = 6 - moreNewsArticles.length;
    const nationalFallback = deduplicator.getUnique(nationalAll, needed);
    moreNewsArticles = [...moreNewsArticles, ...nationalFallback];
  }

  // 2e. Sidebar Top & Columns
  // Maps for Sidebar Items
  const featuredItems = mapArrayToSidebarItems(featuredRaw);
  const nationalItems = mapArrayToSidebarItems(nationalRaw);

  // Sidebar Top Article
  const sidebarTopArticle = deduplicator.getUnique(featuredItems, 1)[0] || deduplicator.getUnique(nationalItems, 1)[0];

  // Sidebar List
  let sidebarColumns = deduplicator.getUnique(featuredItems, 5);
  // Fill sidebar with National if needed
  if (sidebarColumns.length < 5) {
    const needed = 5 - sidebarColumns.length;
    sidebarColumns = [...sidebarColumns, ...deduplicator.getUnique(nationalItems, needed)];
  }

  // 2f. Opinion (Left/Right) - Using Generic pools
  const opinionPool = [...deduplicator.getUnique(featuredSidebarPool, 4), ...deduplicator.getUnique(nationalAll, 4)];
  // Take top 4 from pool
  const validOpinion = opinionPool.slice(0, 4);

  const sidebarOpinion = {
    left: validOpinion.slice(0, 2),
    right: validOpinion.slice(2, 4),
  };

  return {
    topHeadlines,
    featuredArticle,
    jharkhandBottom,
    stateArticles,
    moreNewsArticles,
    sidebarTopArticle,
    sidebarColumns,
    sidebarOpinion,
  };
}

/**
 * Process Technology Section
 */
function processTechnologySection(
  technologyNewsResult: any, // Raw API result
  deduplicator: NewsDeduplicator
) {
  let technologyRaw: NewsResponse[] = "data" in technologyNewsResult && Array.isArray(technologyNewsResult.data)
    ? technologyNewsResult.data
    : [];

  const categoryName = HOME_DATA_CONFIG.titles.technology;

  // Deduction Logic: STRICT
  const techMapped = mapArrayToSectionOneArticles(technologyRaw, categoryName);
  let uniqueTech = deduplicator.getUnique(techMapped, 7);

  // If we don't have enough articles, we make do with what we have.
  // We do NOT backfill Technology with generic news to ensure strict relevance.

  const featuredArticle = uniqueTech[0] || null;
  const sideArticles = uniqueTech.slice(1, 3);

  // Convert remaining to right structure
  const rightArticles = uniqueTech.slice(3, 7).map(a => ({
    id: a.id,
    title: a.title,
    image: a.image || "/placeholder.svg"
  }));

  return {
    categoryName,
    featuredArticle,
    sideArticles,
    rightArticles,
  };
}

/**
 * Process Helper: Generic Category Block Type A (Featured + SubArticles)
 */
function processCategoryBlockA(
  raw: NewsResponse[],
  limit: number,
  fallbackTitle: string,
  deduplicator: NewsDeduplicator
): CategoryBlockTypeAData {
  // STRICT: Only get unique items from this category's raw data
  const uniqueItems = deduplicator.getUniqueRaw(raw, limit);

  const title = fallbackTitle || uniqueItems[0]?.categories?.[0]?.menu?.name?.toUpperCase() || "";

  if (uniqueItems.length === 0) {
    // Return empty struct - Component should handle (hide) this
    return {
      title: fallbackTitle,
      featured: null as any, // Component will check for null
      subArticles: []
    };
  }

  return mapToCategoryBlockTypeA(title, uniqueItems[0], uniqueItems.slice(1));
}

/**
 * Process Helper: Generic Category Block Type B (Featured + Middle + Bottom)
 */
function processCategoryBlockB(
  raw: NewsResponse[],
  limit: number,
  fallbackTitle: string,
  deduplicator: NewsDeduplicator
): CategoryBlockTypeBData {
  // STRICT: Only get unique items
  const uniqueItems = deduplicator.getUniqueRaw(raw, limit);

  const title = fallbackTitle || uniqueItems[0]?.categories?.[0]?.menu?.name?.toUpperCase() || "";

  if (uniqueItems.length === 0) {
    return {
      title: fallbackTitle,
      featured: null as any,
      middleArticles: [],
      bottomArticles: []
    };
  }

  return mapToCategoryBlockTypeB(
    title,
    uniqueItems[0],
    uniqueItems.slice(1, 5),
    uniqueItems.slice(5, 9)
  );
}

/**
 * Process Category Sections (Politics, Sports, Entertainment, Crime, Trending)
 */
function processCategorySections(
  politicsRaw: NewsResponse[],
  sportsRaw: NewsResponse[],
  entertainmentRaw: NewsResponse[],
  crimeRaw: NewsResponse[],
  topTrendingRaw: NewsResponse[],
  featuredRaw: NewsResponse[], // For Exclusive/Sidebar Bottom
  deduplicator: NewsDeduplicator
) {
  // Politics (Block A)
  const politics = processCategoryBlockA(politicsRaw, 5, HOME_DATA_CONFIG.titles.politics, deduplicator);

  // Sports (Block A)
  const sports = processCategoryBlockA(sportsRaw, 5, HOME_DATA_CONFIG.titles.sports, deduplicator);

  // Entertainment (Block B)
  const entertainment = processCategoryBlockB(entertainmentRaw, 9, HOME_DATA_CONFIG.titles.entertainment, deduplicator);

  // Crime (Block A)
  const crime = processCategoryBlockA(crimeRaw, 5, HOME_DATA_CONFIG.titles.crime, deduplicator);

  // Top Trending
  const trendingUnique = deduplicator.getUniqueRaw(topTrendingRaw, 5);
  const topTrending = mapArrayToTopTrendingItems(trendingUnique);

  // Exclusive News (From Featured pool, after main sections are filled)
  const exclusiveUnique = deduplicator.getUniqueRaw(featuredRaw, 4);
  const exclusiveNews = mapArrayToExclusiveNewsItems(exclusiveUnique);

  // Sidebar Bottom (From Featured pool)
  const sidebarBottomUnique = deduplicator.getUniqueRaw(featuredRaw, 6);
  const sidebarBottom = mapArrayToSidebarSmallListItems(sidebarBottomUnique);

  return {
    politics,
    sports,
    entertainment,
    crime,
    topTrending,
    exclusiveNews,
    sidebarBottom
  };
}


// ============================================================================
// 4. MAIN EXPORTED FUNCTION
// ============================================================================

/**
 * Fetch all home page data in a single pass to ensure deduplication across sections
 * 
 * Returns all section data objects with unique articles
 */
export const getCombinedHomeData = cache(async () => {
  try {
    const deduplicator = new NewsDeduplicator();

    // ----------------------------------------
    // A. FETCH RAW DATA IN PARALLEL
    // ----------------------------------------

    // Helper to safely fetch category news
    const fetchCat = (slug: string, limit: number) =>
      getNewsByCategory({ slug }, { limit, includeAuthor: true, includeCategories: true, includeContent: false })
        .catch(() => ({ data: [] }));

    const [
      featuredRaw,
      mostViewedRaw,
      breakingRaw,
      jharkhandRaw,
      biharRaw,
      nationalRaw,
      technologyResult,
      politicsRaw,
      sportsRaw,
      entertainmentRaw,
      crimeRaw,
      topTrendingRaw
    ] = await Promise.all([
      // 1. Featured & Generic Pools
      getCachedFeaturedNews({ limit: HOME_DATA_CONFIG.limits.featured, includeAuthor: true, includeCategories: true, includeContent: false }),
      getCachedMostViewedNews({ limit: HOME_DATA_CONFIG.limits.mostViewed, days: 30, includeAuthor: true, includeCategories: true, includeContent: false }),
      getCachedBreakingNews({ limit: HOME_DATA_CONFIG.limits.breaking, includeAuthor: true, includeCategories: true, includeContent: false }),

      // 2. State & Content Sidebar
      fetchCat(HOME_DATA_CONFIG.slugs.jharkhand, HOME_DATA_CONFIG.limits.sidebarJhk),
      fetchCat(HOME_DATA_CONFIG.slugs.bihar, HOME_DATA_CONFIG.limits.sidebarState),
      fetchCat(HOME_DATA_CONFIG.slugs.national, HOME_DATA_CONFIG.limits.sidebarNational),

      // 3. Technology (Try primary then fallback slug)
      getNewsByCategory({ slug: HOME_DATA_CONFIG.slugs.technology[0] }, { limit: HOME_DATA_CONFIG.limits.technology, includeAuthor: true, includeCategories: true, includeContent: false })
        .catch(() => getNewsByCategory({ slug: HOME_DATA_CONFIG.slugs.technology[1] }, { limit: HOME_DATA_CONFIG.limits.technology, includeAuthor: true, includeCategories: true, includeContent: false }))
        .catch(() => ({ data: [] })),

      // 4. Category Sections
      fetchCat(HOME_DATA_CONFIG.slugs.politics, HOME_DATA_CONFIG.limits.politics),
      fetchCat(HOME_DATA_CONFIG.slugs.sports, HOME_DATA_CONFIG.limits.categoryGeneric),
      fetchCat(HOME_DATA_CONFIG.slugs.entertainment, HOME_DATA_CONFIG.limits.entertainment),
      fetchCat(HOME_DATA_CONFIG.slugs.crime, HOME_DATA_CONFIG.limits.categoryGeneric),

      // 5. Trending
      getCachedMostViewedNews({ limit: HOME_DATA_CONFIG.limits.categoryGeneric, days: 7, includeAuthor: true, includeCategories: true, includeContent: false }),
    ]);

    // ----------------------------------------
    // B. NORMALIZE RAW DATA
    // ----------------------------------------
    // Extract arrays from potentially nested API responses
    const getSafeArray = (res: any) => "data" in res && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

    const featuredNorm = getSafeArray(featuredRaw);
    const mostViewedNorm = getSafeArray(mostViewedRaw);
    const breakingNorm = getSafeArray(breakingRaw);
    const jharkhandNorm = getSafeArray(jharkhandRaw);
    const biharNorm = getSafeArray(biharRaw);
    const nationalNorm = getSafeArray(nationalRaw);
    const politicsNorm = getSafeArray(politicsRaw);
    const sportsNorm = getSafeArray(sportsRaw);
    const entertainmentNorm = getSafeArray(entertainmentRaw);
    const crimeNorm = getSafeArray(crimeRaw);
    const topTrendingNorm = getSafeArray(topTrendingRaw);

    // ----------------------------------------
    // C. PROCESS SECTIONS (SEQUENTIAL FOR DEDUPLICATION)
    // ----------------------------------------

    // 1. Featured Section
    const featuredData = processFeaturedSection(featuredNorm, mostViewedNorm, breakingNorm, deduplicator);

    // 2. Content Sidebar Section
    const contentSidebarData = processContentSidebar(jharkhandNorm, biharNorm, nationalNorm, featuredNorm, deduplicator);

    // 3. Technology Section
    const technologyData = processTechnologySection(technologyResult, deduplicator);

    // 4. Category Sections
    const categorySectionData = processCategorySections(
      politicsNorm,
      sportsNorm,
      entertainmentNorm,
      crimeNorm,
      topTrendingNorm,
      featuredNorm,
      deduplicator
    );

    return {
      featuredData,
      contentSidebarData,
      technologyData,
      categorySectionData
    };

  } catch (error) {
    console.error("Critical Error in getCombinedHomeData:", error);
    // Return safe empty structure
    const emptyCatA = { title: "", featured: null as any, subArticles: [] };
    const emptyCatB = { title: "", featured: null as any, middleArticles: [], bottomArticles: [] };

    return {
      featuredData: { mainFeatured: null, middleFeatured: [], rightTopFeatured: null, rightListMostViewed: [], breakingNews: [] },
      contentSidebarData: { topHeadlines: [], featuredArticle: undefined, jharkhandBottom: [], stateArticles: [], moreNewsArticles: [], sidebarTopArticle: undefined, sidebarColumns: [], sidebarOpinion: undefined },
      technologyData: { categoryName: "TECHNOLOGY", featuredArticle: null!, sideArticles: [], rightArticles: [] },
      categorySectionData: {
        politics: emptyCatA,
        sports: emptyCatA,
        entertainment: emptyCatB,
        crime: emptyCatA,
        topTrending: [],
        exclusiveNews: [],
        sidebarBottom: []
      }
    };
  }
});

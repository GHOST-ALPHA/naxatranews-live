import Link from "next/link"
import { cn } from "@/lib/utils"
import SectionHeader from "../SectionHeader"
import { AdSidebar } from "@/components/ads/ad-sidebar"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import type {
  CategoryBlockTypeAData,
  CategoryBlockTypeBData,
  TopTrendingItem,
  ExclusiveNewsItem,
  SidebarSmallListItem,
} from "@/lib/utils/category-section-mapper"

interface CategoryNewsSectionProps {
  politics: CategoryBlockTypeAData
  sports: CategoryBlockTypeAData
  entertainment: CategoryBlockTypeBData
  crime: CategoryBlockTypeAData
  topTrending: TopTrendingItem[]
  exclusiveNews: ExclusiveNewsItem[]
  sidebarBottom: SidebarSmallListItem[]
}

export function CategoryNewsSection({
  politics,
  sports,
  entertainment,
  crime,
  topTrending,
  exclusiveNews,
  sidebarBottom,
}: CategoryNewsSectionProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Content Column (80% on desktop) */}
        <div className="lg:col-span-9 space-y-12">
          {/* politics*/}
          <CategoryBlockTypeA data={politics} imagePosition="left" />

          {/* Sports Section */}
          <CategoryBlockTypeA data={sports} imagePosition="right" />

          {/* entertainment Section */}
          <CategoryBlockTypeB data={entertainment} />

          {/* Crime Section */}
          <CategoryBlockTypeA data={crime} imagePosition="left" />
        </div>

        {/* Right Sidebar Column (20% on desktop) */}
        <div className="lg:col-span-3 space-y-12">
          {/* Top Trending */}
          <SidebarTopTrending data={topTrending} />

          {/* Exclusive News */}
          <SidebarExclusiveNews data={exclusiveNews} />

          {/* Sidebar Bottom List */}
          <SidebarSmallList data={sidebarBottom} />

          {/* Ad Unit - Dynamic */}
          <AdSidebar position={2} showDefault={true} />
        </div>
      </div>
    </section>
  )
}


function CategoryBlockTypeA({
  data,
  imagePosition = "left",
}: {
  data: CategoryBlockTypeAData
  imagePosition?: "left" | "right"
}) {
  if (!data || !data.featured) return null;
  const featuredSlug = data.featured.slug || "#";

  return (
    <div className="w-full">
      <SectionHeader title={data.title} />

      {/* Featured Article */}
      <article>
        <Link href={`/news/${featuredSlug}`} className="flex flex-col md:flex-row gap-6 mb-8 group cursor-pointer">
          <div
            className={cn(
              "w-full md:w-[60%]",
              imagePosition === "right" && "md:order-2",
            )}
          >
            <OptimizedArticleImage
              src={data.featured.image || "/placeholder.svg?height=600&width=1200"}
              alt={data.featured.title}
              videoUrl={data.featured.videoUrl}
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              aspectRatio="16/9"
              imageClassName="group-hover:scale-105"
            />
          </div>
          <div className="w-full md:w-[40%] flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-3 group-hover:text-red-600 transition-colors">
              {data.featured.title}
            </h2>
            <div className="flex items-center text-xs text-gray-500 mb-4 uppercase tracking-wider font-medium">
              <span className="text-black dark:text-gray-400 mr-2">By {data.featured.author}</span>
              <span>— {data.featured.date}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">{data.featured.excerpt}</p>
          </div>
        </Link>
      </article>

      {/* Sub Articles Grid */}
      {data.subArticles && data.subArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
          {data.subArticles.map((article, idx) => (
            <article key={idx}>
              <Link
                href={`/news/${article.slug || "#"}`}
                className="group cursor-pointer"
              >
                <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors">
                  {article.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryBlockTypeB({ data }: { data: CategoryBlockTypeBData }) {
  if (!data || !data.featured) return null;
  const featuredSlug = data.featured.slug || "#";

  return (
    <div className="w-full">
      <SectionHeader title={data.title} />

      {/* Top Featured */}
      <article>
        <Link href={`/news/${featuredSlug}`} className="flex flex-col md:flex-row gap-6 mb-8 group cursor-pointer">
          <div className="w-full md:w-[60%] flex flex-col justify-center">
            <h2 className="text-2xl font-serif font-bold leading-tight mb-3 group-hover:text-red-600 transition-colors">
              {data.featured.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{data.featured.excerpt}</p>
          </div>
          <div className="w-full md:w-[40%]">
            <OptimizedArticleImage
              src={data.featured.image || "/placeholder.svg?height=600&width=1200"}
              alt={data.featured.title}
              videoUrl={data.featured.videoUrl}
              sizes="(max-width: 768px) 100vw, 40vw"
              aspectRatio="3/2"
              imageClassName="group-hover:scale-105"
            />
          </div>
        </Link>
      </article>

      {/* Middle Grid */}
      {data.middleArticles && data.middleArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-6 border-t border-gray-200">
          {data.middleArticles.map((article, idx) => (
            <article key={idx}>
              <Link
                href={`/news/${article.slug || "#"}`}
                className="flex gap-4 group cursor-pointer items-center"
              >
                <div className="flex-shrink-0 w-24 h-16">
                  <OptimizedArticleImage
                    src={article.image || "/placeholder.svg?height=600&width=1200"}
                    alt={article.title}
                    videoUrl={article.videoUrl}
                    sizes="96px"
                    aspectRatio="3/2"
                    imageClassName="group-hover:scale-110"
                  />
                </div>
                <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                  {article.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Bottom Grid */}
      {data.bottomArticles && data.bottomArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
          {data.bottomArticles.map((article, idx) => (
            <article key={idx}>
              <Link
                href={`/news/${article.slug || "#"}`}
                className="group cursor-pointer"
              >
                <h3 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors">
                  {article.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarTopTrending({ data }: { data: TopTrendingItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full">
      <SectionHeader title="TOP TRENDING" />
      <div className="space-y-8">
        {data.map((item, idx) => (
          <article key={item.id}>
            <Link
              href={`/news/${item.slug}`}
              className="group cursor-pointer block hover:text-red-600"
            >
              <div className="mb-3">
                <OptimizedArticleImage
                  src={item.image || "/placeholder.svg?height=600&width=1200"}
                  alt={item.title}
                  videoUrl={item.videoUrl}
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  aspectRatio="3/2"
                  imageClassName="group-hover:scale-105"
                />
              </div>
              <div className="flex gap-3">
                <span className="text-2xl font-black text-[#FF6B35] leading-none">{item.id}.</span>
                <h3 className="font-serif font-bold text-md leading-tight  transition-colors">
                  {item.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

function SidebarExclusiveNews({ data }: { data: ExclusiveNewsItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full">
      <SectionHeader title="EXCLUSIVE NEWS" />
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, idx) => (
          <article key={idx}>
            <Link
              href={`/news/${item.slug}`}
              className="group cursor-pointer block hover:text-red-600"
            >
              <div className="mb-2">
                <OptimizedArticleImage
                  src={item.image || "/placeholder.svg?height=600&width=1200"}
                  alt={item.title}
                  videoUrl={item.videoUrl}
                  sizes="(max-width: 1024px) 50vw, 12vw"
                  aspectRatio="3/2"
                  imageClassName="group-hover:scale-110"
                />
              </div>
              <h4 className="text-xs font-bold leading-snug  transition-colors line-clamp-3">
                {item.title}
              </h4>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

function SidebarSmallList({ data }: { data: SidebarSmallListItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full space-y-6 pt-6 border-t border-gray-200">
      {data.map((item, idx) => (
        <article key={idx}>
          <Link
            href={`/news/${item.slug}`}
            className="flex gap-4 group cursor-pointer hover:text-red-600"
          >
            <div className="flex-shrink-0 w-24 h-16">
              <OptimizedArticleImage
                src={item.image || "/placeholder.svg?height=600&width=1200"}
                alt={item.title}
                videoUrl={item.videoUrl}
                sizes="96px"
                aspectRatio="3/2"
                imageClassName="group-hover:scale-110"
              />
            </div>
            <h4 className="font-bold text-sm leading-snug  transition-colors line-clamp-3">
              {item.title}
            </h4>
          </Link>
        </article>
      ))}
    </div>
  )
}

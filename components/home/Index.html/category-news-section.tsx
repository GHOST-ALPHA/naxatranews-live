import Link from "next/link"
import { cn } from "@/lib/utils"
import SectionHeader from "../SectionHeader"
import { OptimizedArticleImage } from "@/components/news/optimized-article-image"
import dynamic from "next/dynamic"

// Dynamic imports
const AdSidebar = dynamic(() => import("@/components/ads/ad-sidebar").then(mod => mod.AdSidebar), {
  loading: () => <div className="w-full h-[600px] bg-muted/10 animate-pulse rounded-sm" />
})

const RashifalWidget = dynamic(() => import("@/components/widgets/rashifal-widget").then(mod => mod.RashifalWidget), {
  loading: () => <div className="w-full h-[400px] bg-muted/10 animate-pulse rounded-sm" />
})

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
  business: CategoryBlockTypeBData
  topTrending: TopTrendingItem[]
  exclusiveNews: ExclusiveNewsItem[]
  sidebarBottom: SidebarSmallListItem[]
}

export function CategoryNewsSection({
  politics,
  sports,
  entertainment,
  crime,
  business,
  topTrending,
  exclusiveNews,
  sidebarBottom,
}: CategoryNewsSectionProps) {
  return (
    <section className="container mx-auto px-3 lg:px-0 py-8 feature-section-font">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Content Column (75% on desktop) */}
        <div className="lg:col-span-9 space-y-16">
          {/* politics*/}
          <CategoryBlockTypeA data={politics} imagePosition="left" categoryHref="/rajneeti" />

          {/* Sports Section */}
          <CategoryBlockTypeA data={sports} imagePosition="right" categoryHref="/khel" />

          {/* entertainment Section */}
          <CategoryBlockTypeB data={entertainment} categoryHref="/manoranjan" />

          {/* Crime Section */}
          <CategoryBlockTypeA data={crime} imagePosition="left" categoryHref="/apradh" />

          {/* Business Section */}
          <CategoryBlockTypeB data={business} categoryHref="/vyapar" />
        </div>

        {/* Right Sidebar Column (25% on desktop) */}
        <div className="lg:col-span-3 space-y-10">
          {/* Top Trending */}
          <SidebarTopTrending data={topTrending} />

          {/* Rashifal Widget */}
          <RashifalWidget />

          {/* Exclusive News */}
          <SidebarExclusiveNews data={exclusiveNews} />

          {/* Sidebar Bottom List */}
          <SidebarSmallList data={sidebarBottom} />

          {/* Ad Unit - Dynamic */}
          <div className="pt-4">
            <AdSidebar position={2} showDefault={true} />
          </div>
        </div>
      </div>
    </section>
  )
}


function CategoryBlockTypeA({
  data,
  imagePosition = "left",
  categoryHref,
}: {
  data: CategoryBlockTypeAData
  imagePosition?: "left" | "right"
  categoryHref?: string
}) {
  if (!data || !data.featured) return null;
  const featuredSlug = data.featured.slug || "#";

  return (
    <div className="w-full">
      <SectionHeader title={data.title} href={categoryHref} />

      {/* Featured Article */}
      <article>
        <Link href={`/news/${featuredSlug}`} prefetch={false} className="flex flex-col md:flex-row gap-8 mb-10 group cursor-pointer items-start">
          <div
            className={cn(
              "w-full md:w-[60%] overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-all",
              imagePosition === "right" && "md:order-2",
            )}
          >
            <OptimizedArticleImage
              src={data.featured.image || "/assets/newsplaceholder.webp"}
              alt={data.featured.title}
              videoUrl={data.featured.videoUrl}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              aspectRatio="16/9"
              className="w-full h-full"
              imageClassName="transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="w-full md:w-[40%] flex flex-col justify-center">
            <h2 className="leading-tight mb-4 transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-4" title={data.featured.title}>
              {data.featured.title}
            </h2>
            <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mb-5 uppercase tracking-wider font-bold">
              <span className="text-foreground mr-2">By {data.featured.author}</span>
              <span className="opacity-50">— {data.featured.date}</span>
            </div>
            <p className="feature-section-description line-clamp-6 hindi-clamp hindi-clamp-6 p-0.5">{data.featured.excerpt}</p>
          </div>
        </Link>
      </article>

      {/* Sub Articles Grid */}
      {data.subArticles && data.subArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-border/50">
          {data.subArticles.map((article, idx) => (
            <article key={idx} className="group">
              <Link
                href={`/news/${article.slug || "#"}`}
                prefetch={false}
                className="block transition-colors hover:text-red-600"
              >
                <h3 className="headlines-title transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-3" title={article.title}>
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

function CategoryBlockTypeB({
  data,
  categoryHref
}: {
  data: CategoryBlockTypeBData;
  categoryHref?: string;
}) {
  if (!data || !data.featured) return null;
  const featuredSlug = data.featured.slug || "#";

  return (
    <div className="w-full">
      <SectionHeader title={data.title} href={categoryHref} />

      {/* Top Featured */}
      <article>
        <Link href={`/news/${featuredSlug}`} prefetch={false} className="flex flex-col md:flex-row gap-8 mb-10 group cursor-pointer items-start">
          <div className="w-full md:w-[60%] flex flex-col justify-center">
            <h1 className="leading-tight mb-4 transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-4" title={data.featured.title}>
              {data.featured.title}
            </h1>
            <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mb-5 uppercase tracking-wider font-bold">
              <span className="text-foreground mr-2">By {data.featured.author}</span>
              <span className="opacity-50">— {data.featured.date}</span>
            </div>
            <p className="feature-section-description line-clamp-4 py-0.5 mb-4">{data.featured.excerpt}</p>
          </div>
          <div className="w-full md:w-[40%] overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-all">
            <OptimizedArticleImage
              src={data.featured.image || "/assets/newsplaceholder.webp"}
              alt={data.featured.title}
              videoUrl={data.featured.videoUrl}
              sizes="(max-width: 768px) 100vw, 40vw"
              aspectRatio="3/2"
              className="w-full h-full"
              imageClassName="transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
      </article>

      {/* Middle Grid */}
      {data.middleArticles && data.middleArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 py-8 border-t border-border/50">
          {data.middleArticles.map((article, idx) => (
            <article key={idx} className="group flex gap-4 items-center">
              <Link
                href={`/news/${article.slug || "#"}`}
                prefetch={false}
                className="flex-shrink-0 w-28 h-20 overflow-hidden rounded-sm bg-muted shadow-sm hover:shadow-md transition-all"
              >
                <OptimizedArticleImage
                  src={article.image || "/assets/newsplaceholder.webp"}
                  alt={article.title}
                  videoUrl={article.videoUrl}
                  sizes="120px"
                  aspectRatio="3/2"
                  className="w-full h-full"
                  imageClassName="transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
              <Link
                href={`/news/${article.slug || "#"}`}
                prefetch={false}
                className="flex-1 transition-colors hover:text-red-600"
              >
                <h3 className="content-title hindi-clamp hindi-clamp-3 transition-colors" title={article.title}>
                  {article.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Bottom Grid */}
      {data.bottomArticles && data.bottomArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/50">
          {data.bottomArticles.map((article, idx) => (
            <article key={idx} className="group">
              <Link
                href={`/news/${article.slug || "#"}`}
                prefetch={false}
                className="block transition-colors hover:text-red-600"
              >
                <h3 className="headlines-title transition-colors group-hover:text-red-600">
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
      <SectionHeader title="TOP TRENDING" isLive />
      <div className="space-y-10">
        {data.map((item) => (
          <article key={item.id} className="group">
            <Link
              href={`/news/${item.slug}`}
              prefetch={false}
              className="block mb-4 overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-all"
            >
              <OptimizedArticleImage
                src={item.image || "/assets/newsplaceholder.webp"}
                alt={item.title}
                videoUrl={item.videoUrl}
                sizes="(max-width: 1024px) 100vw, 25vw"
                aspectRatio="3/2"
                className="w-full h-full"
                imageClassName="transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="flex gap-4">
              <span className="text-3xl font-black text-red-600 leading-none opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                {item.id}
              </span>
              <Link href={`/news/${item.slug}`} prefetch={false} className="transition-colors hover:text-red-600">
                <h3 className="content-title leading-snug transition-colors group-hover:text-red-600 hindi-clamp hindi-clamp-3" title={item.title}>
                  {item.title}
                </h3>
              </Link>
            </div>
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
      <SectionHeader title="EXCLUSIVE" />
      <div className="grid grid-cols-2 gap-4 gap-y-6">
        {data.map((item, idx) => (
          <article key={idx} className="group">
            <Link
              href={`/news/${item.slug}`}
              prefetch={false}
              className="block mb-2 overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-all"
            >
              <OptimizedArticleImage
                src={item.image || "/assets/newsplaceholder.webp"}
                alt={item.title}
                videoUrl={item.videoUrl}
                sizes="(max-width: 1024px) 50vw, 12vw"
                aspectRatio="3/2"
                className="w-full h-full"
                imageClassName="transition-transform duration-500 group-hover:scale-110"
              />
            </Link>
            <Link href={`/news/${item.slug}`} prefetch={false} className="transition-colors hover:text-red-600">
              <h3 className="headlines-title transition-colors hindi-clamp hindi-clamp-3" title={item.title}>
                {item.title}
              </h3>
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
    <div className="w-full space-y-6 pt-6 border-t border-border/50">
      {data.map((item, idx) => (
        <article key={idx} className="group flex gap-3 items-center">
          <Link
            href={`/news/${item.slug}`}
            prefetch={false}
            className="flex-shrink-0 w-24 h-16 overflow-hidden rounded-sm bg-muted shadow-sm hover:shadow-md transition-all"
          >
            <OptimizedArticleImage
              src={item.image || "/assets/newsplaceholder.webp"}
              alt={item.title}
              videoUrl={item.videoUrl}
              sizes="96px"
              aspectRatio="3/2"
              className="w-full h-full"
              imageClassName="transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
          <Link
            href={`/news/${item.slug}`}
            prefetch={false}
            className="flex-1 transition-colors hover:text-red-600"
          >
            <h4 className="headlines-title transition-colors hindi-clamp hindi-clamp-3" title={item.title}>
              {item.title}
            </h4>
          </Link>
        </article>
      ))}
    </div>
  )
}

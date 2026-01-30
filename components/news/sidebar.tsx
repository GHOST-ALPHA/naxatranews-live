import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AdSidebar } from "@/components/ads/ad-sidebar"
import { getCachedTodayRecentNews } from "@/lib/services/news-api.service"
import { mapArrayToSidebarItems } from "@/lib/utils/news-mapper-unified"

export async function NewsSidebar() {
  // Fetch latest news dynamically from database
  const latestNews = await getCachedTodayRecentNews({
    limit: 5,
    includeContent: false,
    includeAuthor: false,
    includeCategories: true,
  })

  // Map to sidebar item format
  const sidebarItems = mapArrayToSidebarItems(latestNews)

  // If no recent news today, show empty state
  const displayItems = sidebarItems.length > 0 ? sidebarItems.slice(0, 5) : []

  const tags = ["Politics", "Technology", "Environment", "Business", "Space", "AI", "Health"]

  return (
    <aside className="flex flex-col gap-8">
      {/* Ad Block 1 - Dynamic (Position 0) */}
      <AdSidebar className="mb-8" position={0} showDefault={true} />

      {/* Latest News - Dynamic */}
      <div className="rounded-lg border border-zinc-800 p-5">
        <h3 className="text-lg font-bold  mb-4 border-l-4 border-[#FF6B35] pl-3">Latest News</h3>
        <div className="space-y-4">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="flex gap-3 group">
                <div className="relative w-20 h-14 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800">
                  <Image
                    src={item.image || "/assets/newsplaceholder.webp"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                    sizes="80px"
                  />
                </div>
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-[#FF8C42] transition-colors">
                  {item.title}
                </h4>
              </Link>
            ))
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">No recent news available</p>
          )}
        </div>
      </div>

      {/* Ad Block 2 - Dynamic (Position 1) */}
      <AdSidebar className="mb-8" position={1} showDefault={true} />

      {/* Featured Tags */}
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
          <span>Featured Topics</span>
          <ArrowRight className="w-4 h-4 text-zinc-500" />
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer px-3 py-1 rounded-md transition-all"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  )
}

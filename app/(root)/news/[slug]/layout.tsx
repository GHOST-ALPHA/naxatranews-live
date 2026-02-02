import type React from "react"
import type { Metadata } from "next"
import { ArticleSidebar } from "./_components/article-sidebar"
import { ArticleRightSidebar } from "./_components/article-right-sidebar"
import { AdLeaderboard } from "@/components/ads/ad-leaderboard"
import { AdFooter } from "@/components/ads/ad-footer"
import { AdPopup } from "@/components/ads/ad-popup"
import { AdHeader } from "@/components/ads/ad-header"

// This layout handles the 2-column structure (75% Content / 25% Sidebar)
// It provides a stable structure for all news details
export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* Top Banner Ad - Zone: header, Position: 0 */}

      <AdHeader
        className="w-full"
        showDefault={true}
      />

      <div className="max-w-[90rem] justify-center mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content Area - 75% width on desktop */}
          <main className="w-full lg:w-3/4">{children}</main>

          {/* Sidebar Area - 25% width on desktop */}
          {/* Sticky sidebar logic: sticky top-8 so it stays visible while scrolling */}
          <aside className="w-full lg:w-1/4 space-y-8">
            <div className="lg:sticky lg:top-8">
              <ArticleSidebar />
              {/* <ArticleRightSidebar /> */}
            </div>
          </aside>
        </div>
      </div>

      {/* Footer Ad - Zone: footer, Position: 0 */}
      <AdFooter
        className="w-full my-8"
        showDefault={true}
        position={0}
      />

      {/* Popup Ad - Zone: popup, Position: 0 (Client-side, shows after delay) */}
      <AdPopup showDefault={false} delay={3000} frequency={1} />
    </div>
  )
}

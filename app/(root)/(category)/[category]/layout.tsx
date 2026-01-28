import type React from "react"
import { NewsSidebar } from "@/components/news/sidebar"
import { AdLeaderboard } from "@/components/ads/ad-leaderboard"
import { AdFooter } from "@/components/ads/ad-footer"
import { AdPopup } from "@/components/ads/ad-popup"

// High-performance layout with stable design
export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="">
      {/* Top Banner Ad - Zone: header, Position: 0 */}
      <AdLeaderboard
        className="w-full "
        showDefault={true}
      />

      <main className="max-w-[90rem] justify-center mx-auto px-2 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area (Left 75% - per requirement) */}
          <div className="w-full lg:w-3/4">{children}</div>

          {/* Feature Sidebar (Right 25% - per requirement) */}
          <div className="w-full lg:w-1/4 space-y-8">
            <NewsSidebar />
          </div>
        </div>
      </main>

      {/* Footer Ad - Zone: footer, Position: 0 */}
      <AdFooter
        className="w-full my-8"
        showDefault={true}
        position={0}
      />

      {/* Popup Ad - Zone: popup, Position: 0 (Client-side, shows after delay) */}
      {/* <AdPopup showDefault={true} delay={3000} frequency={1} /> */}
    </div>
  )
}

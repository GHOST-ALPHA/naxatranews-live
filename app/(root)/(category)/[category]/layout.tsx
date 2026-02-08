import type React from "react"
import { AdFooter } from "@/components/ads/ad-footer"
import { AdHeader } from "@/components/ads/ad-header"

// High-performance layout with stable design
export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="">
      {/* Top Banner Ad - Zone: header, Position: 0 */}
      <AdHeader
        className="w-full"
        showDefault={true}
      />


      <main className="max-w-[90rem] justify-center mx-auto px-2 lg:px-8 py-8">
        {children}
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

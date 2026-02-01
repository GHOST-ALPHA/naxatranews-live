"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BreakingNews {
  id: string
  title: string
  slug: string
}

interface BreakingNewsTickerProps {
  news: BreakingNews[]
  onClose?: () => void
  className?: string
}

export function BreakingNewsTicker({ news, onClose, className }: BreakingNewsTickerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || news.length === 0) return null

  return (
    <div
      className={cn(
        "relative w-full  bg-red-700 rounded-full text-white py-2 px-4 overflow-hidden shadow-lg border border-white/10",
        className
      )}
      role="region"
      aria-label="Breaking News Ticker"
    >
      <div className="flex items-center gap-4 h-full relative z-10">
        {/* Breaking News Label */}
        <div className="flex items-center hidden md:flex gap-2 shrink-0 bg-[#102039] px-3 py-1 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-sm z-20">
          <span className="animate-pulse relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Breaking News</span>
        </div>

        {/* Ticker Content */}
        <div className="flex-1 overflow-hidden relative h-4 md:h-6 group">
          {/* Mask shadows for smooth fade effect at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-red-700 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-red-700 to-transparent z-10 pointer-events-none" />

          <div
            className="flex items-center absolute whitespace-nowrap animate-marquee group-hover:pause"
          >
            {/* Duplicate functionality for seamless loop */}
            {[...news, ...news].map((item, i) => (
              <div key={`${item.id}-${i}`} className="inline-flex items-center mx-8">
                <ChevronRight className="h-4 w-4 text-[#102039] mr-2" />
                <Link
                  href={`/news/${item.slug}`}
                  prefetch={false}
                  className="hover:text-[#102039] transition-colors text-sm md:text-base"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="h-6 w-6 shrink-0 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors z-20"
          aria-label="Close breaking news"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        /* Pause animation when the parent group is hovered */
        :global(.group):hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}


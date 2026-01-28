"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScrollToTopProps {
  className?: string
  threshold?: number // Scroll threshold in pixels (default: 400)
  smooth?: boolean // Smooth scroll behavior (default: true)
}

export function ScrollToTop({ 
  className, 
  threshold = 400,
  smooth = true 
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY > threshold
      setIsVisible(scrolled)
    }

    // Initial check
    toggleVisibility()

    // Throttle scroll events for better performance
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          toggleVisibility()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  const scrollToTop = () => {
    setIsScrolling(true)
    
    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    })

    // Reset scrolling state after animation
    setTimeout(() => {
      setIsScrolling(false)
    }, smooth ? 1000 : 100)
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <Button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg",
          "bg-zinc-900 hover:bg-zinc-800",
          "border border-zinc-700",
          "text-white",
          "transition-all duration-300",
          "hover:scale-110 active:scale-95",
          "group",
          isScrolling && "animate-pulse"
        )}
      >
        <ArrowUp 
          className={cn(
            "h-5 w-5 transition-transform duration-300",
            isScrolling && "animate-bounce"
          )} 
        />
        
        {/* Ripple effect on click */}
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-white/20",
            "scale-0 group-active:scale-150",
            "opacity-0 group-active:opacity-100",
            "transition-all duration-500"
          )}
          aria-hidden="true"
        />
      </Button>

      {/* Tooltip on hover (desktop only) */}
      <div
        className={cn(
          "absolute right-full mr-3 top-1/2 -translate-y-1/2",
          "px-3 py-1.5 rounded-md",
          "bg-zinc-900 text-white text-xs font-medium",
          "whitespace-nowrap",
          "opacity-0 group-hover:opacity-100",
          "pointer-events-none",
          "transition-opacity duration-200",
          "hidden md:block",
          "after:content-[''] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2",
          "after:border-4 after:border-transparent after:border-l-zinc-900"
        )}
        role="tooltip"
      >
        Scroll to top
      </div>
    </div>
  )
}


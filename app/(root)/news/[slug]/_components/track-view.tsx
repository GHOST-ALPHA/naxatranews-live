"use client"

import { useEffect, useRef, memo } from "react"
import { sendGAEvent } from '@next/third-parties/google'

interface TrackViewProps {
  newsId: string
}

/**
 * Client component to track news article views
 * Calls the API route to increment viewCount when the page loads
 * Optimized for production: memoized, debounced, and error-safe
 */
function TrackViewComponent({ newsId }: TrackViewProps) {
  const hasTracked = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current || !newsId) return

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController()

    // Track view after a short delay to ensure page is fully loaded
    const trackView = async () => {
      try {
        // Track database view
        fetch(`/api/news/${newsId}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current?.signal,
          keepalive: true,
        }).catch((err) => {
          if (process.env.NODE_ENV === 'development') console.error("DB View Track Error:", err)
        });

        // Track Google Analytics Event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'view_item', {
            event_category: 'engagement',
            event_label: newsId,
            value: 1
          });
        }

        hasTracked.current = true
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to track view:", error)
        }
      }
    }

    // Small delay to ensure page is loaded (reduced for faster tracking)
    const timeoutId = setTimeout(trackView, 1000)

    return () => {
      clearTimeout(timeoutId)
      // Cancel fetch if component unmounts
      abortControllerRef.current?.abort()
    }
  }, [newsId])

  // This component doesn't render anything
  return null
}

// Memoize to prevent unnecessary re-renders
export const TrackView = memo(TrackViewComponent)


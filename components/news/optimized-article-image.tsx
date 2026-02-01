"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedArticleImageProps {
  src: string
  alt: string
  videoUrl?: string // If provided, shows play button overlay
  priority?: boolean
  sizes?: string
  className?: string
  imageClassName?: string
  aspectRatio?: "16/9" | "16/10" | "3/2" | "4/3" | "square" | "video" | "auto"
  showPlayButton?: boolean
  objectFit?: "cover" | "contain"
  onError?: () => void
}


export function OptimizedArticleImage({
  src,
  alt,
  videoUrl,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className = "",
  imageClassName = "",
  aspectRatio = "16/9",
  showPlayButton = true,
  objectFit = "cover",
  onError,
}: OptimizedArticleImageProps) {
  // Handle src changes from parent
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Reset error and update src when prop changes
  if (src !== currentSrc && !imageError) {
    setCurrentSrc(src);
  }

  // Detect if image is a video thumbnail
  const isVideoThumbnail = currentSrc.includes("img.youtube.com") || currentSrc.includes("i.vimeocdn.com")
  const hasVideo = videoUrl && showPlayButton

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio !== "auto" ? {
    "16/9": "aspect-video",
    "16/10": "aspect-[16/10]",
    "3/2": "aspect-[3/2]",
    "4/3": "aspect-[4/3]",
    square: "aspect-square",
    video: "aspect-video",
  }[aspectRatio as string] : ""

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      // Fallback to placeholder
      setCurrentSrc("/assets/newsplaceholder.webp")
      onError?.()
    }
  }

  // Check if we should show play button
  const shouldShowPlayButton = (hasVideo || isVideoThumbnail) && showPlayButton

  return (
    <div className={cn("relative w-full overflow-hidden bg-muted/30", aspectRatioClass, className)}>
      {!imageError && currentSrc ? (
        <>
          <Image
            src={currentSrc}
            alt={alt}
            fill
            className={cn(
              objectFit === "cover" ? "object-cover" : "object-contain",
              "transition-transform duration-300",
              imageClassName
            )}
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            quality={85}
            onError={handleError}
            unoptimized={currentSrc.includes("img.youtube.com") || currentSrc.includes("i.vimeocdn.com")}
          />

          {/* Play Button Overlay for Videos */}
          {shouldShowPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors duration-200">
              <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                <Play className="w-6 h-6 sm:w-6 sm:h-6 fill-foreground text-foreground ml-1" />
              </div>
            </div>
          )}
        </>
      ) : (
        // Fallback placeholder
        <div className="relative w-full h-full bg-muted/50">
          <Image
            src="/assets/newsplaceholder.webp"
            alt="Placeholder"
            fill
            className={cn(
              objectFit === "cover" ? "object-cover" : "object-contain",
            )}
            priority
          />
        </div>
      )}
    </div>
  )
}


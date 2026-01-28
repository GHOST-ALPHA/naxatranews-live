"use client";

import { parseVideoUrl } from "@/lib/utils/video";
import { Badge } from "@/components/ui/badge";
import { Youtube, Video } from "lucide-react";

interface ArticleVideoEmbedProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

/**
 * Article Video Embed Component
 * Displays YouTube, Vimeo, or direct video embeds in news articles
 * Production-ready with responsive design
 */
export function ArticleVideoEmbed({ videoUrl, title, className = "" }: ArticleVideoEmbedProps) {
  if (!videoUrl) return null;

  const videoInfo = parseVideoUrl(videoUrl);

  if (!videoInfo.isValid || !videoInfo.embedUrl) {
    return null;
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Video Container - Responsive aspect ratio */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg sm:rounded-xl shadow-lg bg-muted/30">
        {videoInfo.provider === "youtube" || videoInfo.provider === "vimeo" ? (
          <iframe
            src={videoInfo.embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title || "Video player"}
            loading="lazy"
          />
        ) : videoInfo.provider === "direct" ? (
          <video
            controls
            className="w-full h-full"
            preload="metadata"
            poster={videoInfo.thumbnailUrl || undefined}
          >
            <source src={videoInfo.embedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : null}
      </div>

      {/* Provider Badge */}
      <div className="mt-2 flex items-center justify-center gap-2">
        {videoInfo.provider === "youtube" && (
          <>
            <Youtube className="h-4 w-4 text-red-600" />
            <Badge variant="secondary" className="text-xs">
              YouTube Video
            </Badge>
          </>
        )}
        {videoInfo.provider === "vimeo" && (
          <>
            <Video className="h-4 w-4 text-blue-500" />
            <Badge variant="secondary" className="text-xs">
              Vimeo Video
            </Badge>
          </>
        )}
        {videoInfo.provider === "direct" && (
          <>
            <Video className="h-4 w-4" />
            <Badge variant="secondary" className="text-xs">
              Video
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}


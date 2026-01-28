"use client";

import { useState, useEffect } from "react";
import { parseVideoUrl, type VideoInfo } from "@/lib/utils/video";
import { Button } from "@/components/ui/button";
import { X, Play, Youtube, Video, ExternalLink } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";

interface VideoPreviewProps {
  videoUrl: string;
  onRemove?: () => void;
  showRemove?: boolean;
  className?: string;
}

export function VideoPreview({ videoUrl, onRemove, showRemove = true, className = "" }: VideoPreviewProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    if (videoUrl) {
      const info = parseVideoUrl(videoUrl);
      setVideoInfo(info);
    } else {
      setVideoInfo(null);
    }
  }, [videoUrl]);

  if (!videoUrl || !videoInfo || !videoInfo.isValid) {
    return null;
  }

  const { provider, embedUrl, thumbnailUrl, videoId } = videoInfo;

  return (
    <div className={`relative space-y-2 ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        {showEmbed && embedUrl ? (
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video player"
          />
        ) : (
          <>
            {thumbnailUrl && (
              <OptimizedImage
                src={thumbnailUrl}
                alt="Video thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="rounded-full"
                onClick={() => setShowEmbed(true)}
              >
                <Play className="h-6 w-6 mr-2 fill-current" />
                Play Video
              </Button>
            </div>
            {showRemove && onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {provider === 'youtube' && (
            <>
              <Youtube className="h-4 w-4 text-red-600" />
              <Badge variant="secondary">YouTube</Badge>
            </>
          )}
          {provider === 'vimeo' && (
            <>
              <Video className="h-4 w-4 text-blue-500" />
              <Badge variant="secondary">Vimeo</Badge>
            </>
          )}
          {provider === 'direct' && (
            <>
              <Video className="h-4 w-4" />
              <Badge variant="secondary">Direct Video</Badge>
            </>
          )}
        </div>
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-xs truncate max-w-[200px]">{videoUrl}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}


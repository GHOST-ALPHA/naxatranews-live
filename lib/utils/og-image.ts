/**
 * Open Graph Image Utility
 * Gets the best image for OG tags with fallback chain:
 * ogImage > coverImage > video thumbnail > default
 */

import { parseVideoUrl } from "./video";

interface NewsImageData {
  ogImage?: string | null;
  coverImage?: string | null;
  coverVideo?: string | null;
}

/**
 * Get the best image URL for Open Graph tags
 * Priority: ogImage > coverImage > video thumbnail > default
 */
export function getBestOGImage(
  news: NewsImageData,
  defaultImage: string = "/assets/og-default.webp"
): string {
  // 1. Use ogImage if available
  if (news.ogImage) {
    return news.ogImage;
  }

  // 2. Use coverImage if available
  if (news.coverImage) {
    return news.coverImage;
  }

  // 3. Extract video thumbnail if video exists
  if (news.coverVideo) {
    const videoInfo = parseVideoUrl(news.coverVideo);
    if (videoInfo.isValid && videoInfo.thumbnailUrl) {
      return videoInfo.thumbnailUrl;
    }
  }

  // 4. Fallback to default
  return defaultImage;
}


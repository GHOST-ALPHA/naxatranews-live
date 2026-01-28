/**
 * Video URL Utilities
 * Handles YouTube, Vimeo, and direct video URLs
 */

export type VideoProvider = 'youtube' | 'vimeo' | 'direct' | null;

export interface VideoInfo {
  provider: VideoProvider;
  videoId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  isValid: boolean;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoId(url: string): string | null {
  const patterns = [
    /(?:vimeo\.com\/)(\d+)/,
    /(?:player\.vimeo\.com\/video\/)(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if URL is a valid video URL
 */
function isValidVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Check for YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return extractYouTubeId(url) !== null;
  }

  // Check for Vimeo
  if (url.includes('vimeo.com')) {
    return extractVimeoId(url) !== null;
  }

  // Check for direct video URLs
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const isDirectVideo = videoExtensions.some(ext => 
    url.toLowerCase().endsWith(ext)
  );

  // Check if it's a valid HTTP/HTTPS URL
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parse video URL and extract information
 */
export function parseVideoUrl(url: string): VideoInfo {
  if (!url || typeof url !== 'string') {
    return {
      provider: null,
      videoId: null,
      embedUrl: null,
      thumbnailUrl: null,
      isValid: false,
    };
  }

  const trimmedUrl = url.trim();

  // YouTube
  const youtubeId = extractYouTubeId(trimmedUrl);
  if (youtubeId) {
    return {
      provider: 'youtube',
      videoId: youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      isValid: true,
    };
  }

  // Vimeo
  const vimeoId = extractVimeoId(trimmedUrl);
  if (vimeoId) {
    // Vimeo thumbnail format: https://i.vimeocdn.com/video/{videoId}_640.jpg
    // Note: This may not work for all videos, but it's a good fallback
    // For production, consider using Vimeo API for reliable thumbnails
    return {
      provider: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      thumbnailUrl: `https://i.vimeocdn.com/video/${vimeoId}_640.jpg`, // Try standard Vimeo thumbnail format
      isValid: true,
    };
  }

  // Direct video URL
  if (isValidVideoUrl(trimmedUrl)) {
    return {
      provider: 'direct',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
      isValid: true,
    };
  }

  return {
    provider: null,
    videoId: null,
    embedUrl: null,
    thumbnailUrl: null,
    isValid: false,
  };
}

/**
 * Validate video URL format
 */
export function validateVideoUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const videoInfo = parseVideoUrl(url);
  
  if (!videoInfo.isValid) {
    return {
      isValid: false,
      error: 'Invalid video URL. Please provide a valid YouTube, Vimeo, or direct video URL.',
    };
  }

  return { isValid: true };
}

/**
 * Get video embed HTML (for server-side rendering)
 */
export function getVideoEmbedHtml(videoUrl: string, width: number = 560, height: number = 315): string | null {
  const videoInfo = parseVideoUrl(videoUrl);
  
  if (!videoInfo.isValid || !videoInfo.embedUrl) {
    return null;
  }

  if (videoInfo.provider === 'youtube' || videoInfo.provider === 'vimeo') {
    return `<iframe width="${width}" height="${height}" src="${videoInfo.embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  if (videoInfo.provider === 'direct') {
    return `<video width="${width}" height="${height}" controls><source src="${videoInfo.embedUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }

  return null;
}


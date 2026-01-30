import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security Headers Configuration
 * Adds security headers to all responses
 */

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  // Allow YouTube, YouTube-nocookie, Vimeo, and Twitter/X iframes for video/embed embeds
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://platform.twitter.com https://cdn.syndication.twimg.com; " +
    "style-src 'self' 'unsafe-inline' https://platform.twitter.com https://fonts.googleapis.com; " +
    "img-src 'self' blob: data: https: http: https://img.youtube.com https://i.vimeocdn.com https://pbs.twimg.com https://abs.twimg.com; " +
    "media-src 'self' blob: https://account18.livebox.co.in; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://api.twitter.com https://syndication.twitter.com https://api.open-meteo.com https://air-quality-api.open-meteo.com https://api.bigdatacloud.net https://api-bdc.io https://account18.livebox.co.in; " +
    "frame-src 'self' https://www.youtube.com https://youtube.com https://youtu.be https://www.youtube-nocookie.com https://youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://twitter.com https://x.com https://platform.twitter.com; " +
    "frame-ancestors 'none';"
  );

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );

  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}


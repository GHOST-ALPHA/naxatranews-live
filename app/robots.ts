import { MetadataRoute } from 'next'
import { env } from '@/lib/config/env'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://www.bawalnews.com/'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/admin/',
          '/_next/',
          '/storage/private/',
          '/search?*', // Allow search page but not query params in sitemap
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/admin/',
          '/_next/',
          '/storage/private/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/admin/',
          '/_next/',
          '/storage/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}


import { MetadataRoute } from 'next'
import { env } from '@/lib/config/env'

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://www.naxatranewshindi.com/'

  return {
    name: 'Naxatra News - Latest Hindi News',
    short_name: 'Naxatra News',
    description: 'Stay informed with the latest Hindi news, breaking updates, and featured stories from around the world.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#09090b',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logo/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['news', 'entertainment', 'education'],
    lang: 'hi',
    dir: 'ltr',
    scope: baseUrl,
  }
}


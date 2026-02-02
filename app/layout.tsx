import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { cn } from '@/lib/utils';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';

import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Script from 'next/script';
import './globals.css';
import './theme.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.NaxatranewsHindi.com/'),
  title: {
    default: 'Naxatra News Hindi - Latest Hindi News',
    template: '%s | Naxatra News Hindi',
  },
  description: 'Stay informed with the latest Hindi news, breaking updates, and featured stories from around the world.',
  keywords: ['Hindi News', 'Latest News', 'Breaking News', 'India News', 'News in Hindi', 'समाचार'],
  authors: [{ name: 'Naxatra News Hindi Team' }],
  creator: 'Naxatra News Hindi',
  publisher: 'Naxatra News Hindi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    alternateLocale: 'en_US',
    siteName: 'Naxatra News Hindi',
    title: 'Naxatra News Hindi - Latest Hindi News',
    description: 'Stay informed with the latest Hindi news, breaking updates, and featured stories from around the world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naxatra News Hindi - Latest Hindi News',
    description: 'Stay informed with the latest Hindi news, breaking updates, and featured stories from around the world.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Static build compatible: No server-side cookies
  const activeThemeValue = 'system';
  const isScaled = false;

  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang='hi' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={activeThemeValue}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>

        {/* Google Analytics */}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}

        {/* Google Tag Manager - if used concurrently with GA4, or as standalone */}
        {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}

        {/* Google AdSense - Manual Script for Stability */}
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

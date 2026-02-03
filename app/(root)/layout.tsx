import { Footer } from '@/components/home/Footer/footer';
import { Navbar } from '@/components/home/Header/Navbar';
import { getCachedPublicMenusTree } from '@/services/menu.service';

import { ScrollToTop } from '@/components/ui/scroll-to-top';

import Script from 'next/script';
import React, { Suspense } from 'react';

export default async function HomeLayout({

  children
}: {
  children: React.ReactNode;
}) {
  // Fetch menus server-side for faster initial load
  const menus = await getCachedPublicMenusTree();

  return (
    <>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <Navbar menus={menus} />



      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>



      <Footer />

      {/* Modern Scroll to Top Button */}
      <ScrollToTop threshold={400} smooth={true} />
    </>
  )
}

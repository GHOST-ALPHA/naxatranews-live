import Home from "@/components/home/Index.html";
import { Metadata } from "next";
import { AdHeader } from '@/components/ads/ad-header';
import { AdFooter } from '@/components/ads/ad-footer';


// Revalidate every 60 seconds for fresh content
export const revalidate = 1;

export const metadata: Metadata = {
  title: "Naxatra News Hindi - Latest Hindi News | Breaking News in Hindi",
  description: "BawalNews पर पढ़ें ताज़ा हिंदी समाचार, ब्रेकिंग न्यूज़, और दुनिया भर की खबरें। Get latest Hindi news, breaking news, and featured stories from around the world.",
  keywords: [
    "Hindi News",
    "Latest News in Hindi",
    "Breaking News",
    "India News",
    "समाचार",
    "ताज़ा खबरें",
    "ब्रेकिंग न्यूज़",
    "भारत समाचार",
  ],
  openGraph: {
    title: "Naxatra News Hindi - Latest Hindi News | Breaking News in Hindi",
    description: "BawalNews पर पढ़ें ताज़ा हिंदी समाचार, ब्रेकिंग न्यूज़, और दुनिया भर की खबरें।",
    type: "website",
    locale: "hi_IN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naxatra News Hindi - Latest Hindi News",
    description: "BawalNews पर पढ़ें ताज़ा हिंदी समाचार, ब्रेकिंग न्यूज़, और दुनिया भर की खबरें।",
  },
  alternates: {
    canonical: "/",
    languages: {
      "hi": "/",
      "en": "/",
    },
  },
};



export default async function HomePage() {
  return (
    <>
      {/* Top Banner Ad - Zone: header, Position: 0 */}
      <AdHeader
        className="w-full"
        showDefault={true}
      />

      <div className="max-w-[85rem] mx-auto py-8">
        <Home />
      </div>

      {/* Footer Ad - Zone: footer, Position: 0 */}
      <AdFooter
        className="w-full my-8"
        showDefault={true}
        position={0}
      />
    </>
  );
}

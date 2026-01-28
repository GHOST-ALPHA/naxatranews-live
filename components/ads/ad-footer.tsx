/**
 * Ad Footer Component
 * Footer banner advertisement (728x90)
 */

import { AdBanner } from "./ad-banner";
import { getActiveAdsByZone, getDefaultAd, type AdDisplay } from "@/lib/services/ads.service";
import { Suspense } from "react";

interface AdFooterProps {
  className?: string;
  showDefault?: boolean;
  position?: number; // Position index (0-based) to display specific ad
}

async function AdFooterContent({ showDefault = true, position = 0 }: { showDefault: boolean; position: number }) {
  let ad: AdDisplay | null = null;
  
  try {
    const ads = await getActiveAdsByZone("footer", 5); // Fetch up to 5 ads
    ad = ads[position] || null;
  } catch (error) {
    console.error("Error loading footer ad:", error);
  }

  // Always show default if no ad found and showDefault is true
  if (!ad && showDefault) {
    ad = getDefaultAd("footer");
  }

  if (!ad) {
    return null;
  }

  return (
    <div className="flex justify-center w-full">
      <AdBanner ad={ad} size="leaderboard" showLabel={true} />
    </div>
  );
}

export function AdFooter({ className, showDefault = true, position = 0 }: AdFooterProps) {
  return (
    <div className={className || "w-full py-8 flex justify-center items-center"}>
      <Suspense
        fallback={
          <div className="w-full max-w-[728px] h-[90px] bg-muted rounded-lg animate-pulse mx-auto border border-border" />
        }
      >
        <AdFooterContent showDefault={showDefault} position={position} />
      </Suspense>
    </div>
  );
}


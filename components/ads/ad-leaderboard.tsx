/**
 * Ad Leaderboard Component
 * Horizontal leaderboard advertisement (970x90)
 */

import { AdBanner } from "./ad-banner";
import { getActiveAdsByZone, getDefaultAd, type AdDisplay } from "@/lib/services/ads.service";
import { Suspense } from "react";

interface AdLeaderboardProps {
  className?: string;
  showDefault?: boolean;
  position?: number;
}

async function AdLeaderboardContent({ showDefault = true, position = 0 }: { showDefault: boolean; position: number }) {
  let ad: AdDisplay | null = null;

  try {
    const ads = await getActiveAdsByZone("leaderboard", 5);
    ad = ads[position] || null;
  } catch (error) {
    console.error("Error loading leaderboard ad:", error);
  }

  // Always show default if no ad found and showDefault is true
  if (!ad && showDefault) {
    ad = getDefaultAd("leaderboard");
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

export function AdLeaderboard({ className, showDefault = true, position = 0 }: AdLeaderboardProps) {
  return (
    <div className={className || "w-full py-4 flex justify-center items-center"}>
      <Suspense
        fallback={
          <div className="w-full max-w-[970px] h-[90px] bg-muted rounded-sm animate-pulse mx-auto border border-border" />
        }
      >
        <AdLeaderboardContent showDefault={showDefault} position={position} />
      </Suspense>
    </div>
  );
}


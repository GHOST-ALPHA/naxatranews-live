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
  size?: "leaderboard" | "sidebar" | "small" | "medium" | "large";
}

async function AdLeaderboardContent({
  showDefault = true,
  position = 0,
  size = "leaderboard"
}: {
  showDefault: boolean;
  position: number;
  size: "leaderboard" | "sidebar" | "small" | "medium" | "large";
}) {
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
      <AdBanner ad={ad} size={size} showLabel={true} />
    </div>
  );
}

export function AdLeaderboard({
  className,
  showDefault = true,
  position = 0,
  size = "leaderboard"
}: AdLeaderboardProps) {
  const fallbackClasses = {
    leaderboard: "lg:h-[180px] md:h-[120px] h-[100px] max-w-[1400px]",
    sidebar: "aspect-[3/4] max-w-[350px]",
    small: "h-16",
    medium: "h-28",
    large: "md:h-36 h-28",
  };

  return (
    <div className={className || "w-full py-4 flex justify-center items-center"}>
      <Suspense
        fallback={
          <div className={`w-full ${fallbackClasses[size]} bg-muted rounded-sm animate-pulse mx-auto border border-border`} />
        }
      >
        <AdLeaderboardContent showDefault={showDefault} position={position} size={size} />
      </Suspense>
    </div>
  );
}


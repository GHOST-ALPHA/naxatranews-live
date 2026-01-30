/**
 * Ad Header Component
 * Top horizontal banner advertisement for the header zone
 */

import { AdBanner } from "./ad-banner";
import { getActiveAdsByZone, getDefaultAd, type AdDisplay } from "@/lib/services/ads.service";
import { Suspense } from "react";

interface AdHeaderProps {
    className?: string;
    showDefault?: boolean;
    position?: number;
}

async function AdHeaderContent({ showDefault = true, position = 0 }: { showDefault: boolean; position: number }) {
    let ad: AdDisplay | null = null;

    try {
        const ads = await getActiveAdsByZone("header", 5);
        ad = ads[position] || null;
    } catch (error) {
        console.error("Error loading header ad:", error);
    }

    // Always show default if no ad found and showDefault is true
    if (!ad && showDefault) {
        ad = getDefaultAd("header");
    }

    if (!ad) {
        return null;
    }

    return (
        <div className="flex justify-center w-full">
            <AdBanner ad={ad} size="large" showLabel={true} priority={true} />
        </div>
    );
}

export function AdHeader({ className, showDefault = true, position = 0 }: AdHeaderProps) {
    return (
        <div className={className || "w-full py-4 flex justify-center items-center"}>
            <Suspense
                fallback={
                    <div className="w-full max-w-[1400px] h-[140px] bg-muted rounded-sm animate-pulse mx-auto border border-border" />
                }
            >
                <AdHeaderContent showDefault={showDefault} position={position} />
            </Suspense>
        </div>
    );
}

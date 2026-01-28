/**
 * Get Popup Ad API
 * Returns active popup advertisement
 */

import { NextResponse } from "next/server";
import { getActiveAdsByZone, getDefaultAd } from "@/lib/services/ads.service";

export async function GET() {
  try {
    const ads = await getActiveAdsByZone("popup", 1);
    const ad = ads[0] || null;

    if (!ad) {
      // Return default popup ad
      return NextResponse.json({
        ad: getDefaultAd("popup"),
      });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error loading popup ad:", error);
    // Return default ad on error
    return NextResponse.json({
      ad: getDefaultAd("popup"),
    });
  }
}


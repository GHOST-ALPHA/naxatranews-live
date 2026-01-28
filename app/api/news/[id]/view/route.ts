import { NextRequest, NextResponse } from "next/server";
import { trackNewsView } from "@/lib/actions/news";
import { headers } from "next/headers";

/**
 * Track News View API Route
 * POST /api/news/[id]/view
 * 
 * Tracks a view for a news article and increments the viewCount
 * Public endpoint - no authentication required
 * Production-optimized: Rate limiting and caching headers
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10; // 10 seconds max

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "News ID is required" },
        { status: 400 }
      );
    }

    // Get IP address and user agent from headers
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "unknown";
    
    const userAgent = headersList.get("user-agent") || undefined;

    // Track the view
    const result = await trackNewsView(id, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to track view" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "View tracked successfully" },
      { 
        status: 200,
        headers: {
          // Production: Cache control for API responses
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        }
      }
    );
  } catch (error) {
    // Production: Only log errors, don't expose details to client
    if (process.env.NODE_ENV === 'development') {
      console.error("Track news view API error:", error);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track view",
        // Production: Don't expose error details
        ...(process.env.NODE_ENV === 'development' && {
          message: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  }
}


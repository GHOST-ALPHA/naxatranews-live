import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt-core";
import { applySecurityHeaders } from "@/lib/security/headers";

/**
 * Middleware for Route Protection
 * Handles authentication and permission-based access control
 */

// Public routes that don't require authentication
const publicRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/api/auth"];

// Routes that require authentication but not specific permissions
const authRoutes = ["/dashboard"];

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route));
}

/**
 * Check if route requires authentication
 */
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api/dashboard");
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow storage paths (uploaded media files) - skip middleware processing
  if (pathname.startsWith("/storage/") || pathname.startsWith("/api/storage/")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Check authentication for protected routes
  if (isAuthRoute(pathname)) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/auth/sign-in", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token (async in Edge runtime with jose)
    const payload = await verifyToken(token);
    if (!payload) {
      // Invalid token, redirect to login
      const loginUrl = new URL("/auth/sign-in", request.url);
      loginUrl.searchParams.set("error", "invalid_token");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth-token");
      return response;
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - storage (uploaded media files)
     * - public folder files (image extensions)
     */
    "/((?!_next/static|_next/image|favicon.ico|storage|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


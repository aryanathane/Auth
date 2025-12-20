import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy middleware to protect routes with authentication
 * Checks for valid JWT token and redirects unauthenticated users to login
 */
export async function proxy(req: NextRequest) {
  // Extract the pathname from the request URL
  const { pathname } = req.nextUrl;
  
  // Define routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth", "/favicon.ico"];

  // Allow access to public routes without authentication check
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user has a valid JWT token (authenticated session)
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  // If no token exists, user is not authenticated
  if (!token) {
    // Create login URL with the current pathname as callback
    const loginURL = new URL("/login", req.url);
    // Store the original destination to redirect back after login
    loginURL.searchParams.set("callbackUrl", pathname);
    // Redirect unauthenticated user to login page
    return NextResponse.redirect(loginURL);
  }

  // User is authenticated, allow them to proceed to the requested route
  return NextResponse.next();
}

/**
 * Configuration for which routes this middleware should run on
 * Excludes Next.js internal routes and static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
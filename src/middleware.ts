/**
 * Next.js Middleware for Supabase Auth session refresh.
 * Optimized to only call getUser() on protected routes to improve performance.
 * 
 * Performance Note: getUser() makes a network call to Supabase. We only call it
 * when necessary (protected routes or API routes) to avoid blocking public pages.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/satici-paneli", "/dashboard", "/sell", "/profil-duzenle", "/adreslerim", "/siparislerim", "/favoriler", "/mesajlar", "/ayarlar"];

// Routes that should redirect to home if already logged in
const authRoutes = ["/hesap"];

// Check if path is an API route
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

// Check if path is a protected route
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Only create Supabase client if we need to check auth
  // This avoids unnecessary initialization on public pages
  const needsAuthCheck = isProtectedRoute(pathname) || isApiRoute(pathname);

  if (!needsAuthCheck) {
    // Public page - skip auth check entirely for better performance
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on request for next handler
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Set cookie on response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Only call getUser() for protected routes or API routes
  // This is the expensive network call we're optimizing
  const { data: { user } } = await supabase.auth.getUser();

  // Check if trying to access protected route without auth
  if (isProtectedRoute(pathname)) {
    if (!user) {
      const redirectUrl = new URL("/hesap", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// Only run middleware on API routes and pages that need auth
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


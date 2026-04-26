import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that are accessible only to non-authenticated users
const publicPaths = ['/login', '/register'];

// Define paths that are protected (require authentication)
// If we had more top-level protected paths, we'd add them here.
// For now, any path that isn't public and isn't the root '/' can be considered protected if it starts with /dashboard, etc.
const protectedPrefixes = ['/dashboard', '/study-plan', '/practice', '/analytics', '/settings'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the refresh token from cookies
  const hasToken = request.cookies.has('refreshToken');

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isProtectedPath = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  // 1. Hybrid root route: Logged-in users visiting '/' go straight to dashboard
  if (pathname === '/' && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is trying to access a public auth path (login/register) but already authenticated,
  // redirect them to the dashboard.
  if (isPublicPath && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is trying to access a protected path but they are NOT authenticated,
  // redirect them to the login page.
  if (isProtectedPath && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Otherwise, let the request proceed normally
  return NextResponse.next();
}

// Config ensures the middleware only runs on necessary routes to optimize performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

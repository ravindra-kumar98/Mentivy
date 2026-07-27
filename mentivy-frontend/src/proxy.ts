import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths only for unauthenticated users (login, register)
const unauthOnlyPaths = ['/login', '/register'];

// Paths accessible to authenticated users for special flows (not blocked by auth redirect)
const authFlowPaths = ['/onboarding'];

// Define paths that are protected (require authentication)
const protectedPrefixes = ['/dashboard', '/study-plan', '/practice', '/analytics', '/settings'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the refresh token from cookies
  const hasToken = request.cookies.has('refreshToken');
  const needsOnboarding = request.cookies.get('needsOnboarding')?.value === 'true';

  const isUnauthOnlyPath = unauthOnlyPaths.some(path => pathname.startsWith(path));
  const isAuthFlowPath = authFlowPaths.some(path => pathname.startsWith(path));
  const isProtectedPath = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  // 1. Root route: Logged-in users visiting '/' go to their destination
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL(needsOnboarding ? '/onboarding' : '/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Onboarding Guard (MUST CHECK BEFORE other redirects):
  //    Authenticated users who still need onboarding must stay on /onboarding.
  if (hasToken && needsOnboarding && !isAuthFlowPath) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 3. Onboarding page access for unauthenticated users → send to login
  if (isAuthFlowPath && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Authenticated users visiting login/register → redirect to dashboard
  if (isUnauthOnlyPath && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 5. Protected paths require authentication
  if (isProtectedPath && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Otherwise, let the request proceed normally
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

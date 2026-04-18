import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — authentication gate.
 *
 * Responsibility: redirect unauthenticated requests away from /app routes
 * and authenticated users away from /auth routes.
 *
 * ⚠️  Role-based permission checks are NOT performed here.
 *     Middleware runs on the Edge and does not have access to the full user
 *     object (roles, parish_id, etc.). Those checks live in PermissionGuard
 *     (client) and in the Laravel backend (policies).
 *
 * Token storage note:
 *   The current AuthContext stores the token in localStorage under the key
 *   "authToken". Middleware cannot read localStorage — it only has access to
 *   cookies. To enable robust server-side auth checking, the login flow should
 *   also set a "authToken" httpOnly cookie (as described in the technical doc).
 *   Until that migration is complete, /app routes are protected client-side
 *   via AppLayout → useAuth().
 */

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookie (future: set by login API route)
  const token = request.cookies.get('authToken')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Already authenticated → redirect away from auth pages
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Not authenticated → redirect to login
  if (pathname.startsWith('/app') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - _next/static (static files)
     *   - _next/image  (image optimisation)
     *   - favicon.ico
     *   - public assets (svg, png, jpg, …)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

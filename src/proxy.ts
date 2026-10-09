import { type NextRequest, NextResponse } from 'next/server';

/**
 * Thin Proxy — Next.js 16 convention.
 *
 * ARCHITECTURAL RULE: This function ONLY checks for cookie existence and
 * performs basic CSRF header validation. It does NOT verify JWT signatures.
 *
 * Authoritative JWT verification (signature + expiry) is done in:
 * - Server Components via `verifySession()` in `src/lib/verify-session.ts`
 * - Route Handlers (when needed)
 */

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim());

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── CSRF Protection ───────────────────────────────────────────────────────
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { success: false, error: { code: 403, message: 'Forbidden origin' } },
        { status: 403 }
      );
    }
  }

  // ─── Route Protection (Thin Check Only) ────────────────────────────────────
  const isProtectedRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/board' ||
    pathname.startsWith('/board/') ||
    pathname === '/me' ||
    pathname.startsWith('/me/') ||
    pathname.startsWith('/epics') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/admin');


  const token = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (isProtectedRoute && !token && !refreshToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If already logged in, redirect /login to /dashboard
  if (pathname === '/login' && (token || refreshToken)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

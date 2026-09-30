import { type NextRequest, NextResponse } from 'next/server';

/**
 * Thin Proxy — Next.js 16 convention (replaces deprecated middleware.ts).
 *
 * ARCHITECTURAL RULE: This function ONLY checks for cookie existence and
 * performs basic CSRF header validation. It does NOT verify JWT signatures.
 *
 * Authoritative JWT verification (signature + expiry) is done in:
 * - Server Components via `verifySession()` in `src/lib/verify-session.ts`
 * - Route Handlers (when needed)
 *
 * This two-layer pattern prevents both "logout loops" (cookie refresh not synced)
 * and "auth bypass" (relying solely on cookie presence, not validity).
 */

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── CSRF Protection ───────────────────────────────────────────────────────
  // Validate Origin/Referer for all state-mutating requests.
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
  // Only check for cookie EXISTENCE here — not validity.
  // Actual JWT verification happens in the dashboard layout Server Component.
  const isProtectedRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  if (isProtectedRoute) {
    const token = req.cookies.get('access_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (.png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

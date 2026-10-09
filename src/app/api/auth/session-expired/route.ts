import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/session-expired
 *
 * Clears auth cookies then redirects to /login. Server Components can't
 * mutate cookies directly, so `(dashboard)/layout.tsx` redirects here
 * instead of straight to `/login` whenever `verifySession()` fails.
 *
 * Without this, a present-but-invalid `access_token` cookie causes an
 * infinite redirect loop: the layout bounces to `/login`, but `proxy.ts`'s
 * cheap existence-only check still sees a token and bounces back to
 * `/dashboard`. Clearing the cookie here breaks that loop.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  cookieStore.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 0,
  });

  return NextResponse.redirect(new URL('/login', request.url));
}

import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 86400);

/**
 * GET /api/auth/session-expired
 *
 * Handler called when Server Components detect an expired or missing access_token.
 * If a valid refresh_token exists, it attempts transparent recovery:
 * exchanges refresh_token for new tokens, sets cookies, and redirects back.
 * If refresh fails or no refresh_token exists, clears cookies and redirects to /login.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3001';
  const fromParam = request.nextUrl.searchParams.get('from');
  const referer = request.headers.get('referer');

  let targetPath = fromParam || (referer ? new URL(referer, origin).pathname : '/dashboard');
  if (targetPath.startsWith('/login') || targetPath.startsWith('/api')) {
    targetPath = '/dashboard';
  }

  // 1. Attempt transparent session recovery if refresh_token is present
  if (refreshToken) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const backendResponse = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        const data = await backendResponse.json();

        cookieStore.set('access_token', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: ACCESS_TOKEN_TTL,
        });

        if (data.refreshToken) {
          const ttl = Number(data.refreshTokenTtl ?? REFRESH_TOKEN_TTL);
          cookieStore.set('refresh_token', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: ttl,
          });
        }

        // Successfully recovered! Redirect back to destination
        return NextResponse.redirect(new URL(targetPath, origin));
      }
    } catch {
      // Network or timeout error: continue to logout cleanup
    }
  }

  // 2. Refresh failed or no refresh token: clear all auth cookies and go to /login
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

  return NextResponse.redirect(new URL('/login', origin));
}

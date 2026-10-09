import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 86400);

/**
 * POST /api/auth/refresh
 *
 * Token refresh endpoint — reads the refresh_token from the cookie (path: '/')
 * and exchanges it for a new access token and rotated refresh token.
 *
 * Called by the Axios interceptor in `api-client.ts` when a 401 is received.
 * Note: The race condition guard (shared refreshPromise) lives in api-client.ts.
 */
export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: { code: 401, message: 'No refresh token' } },
      { status: 401 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      // Refresh token is expired or revoked — force logout
      // Clear all cookies
      cookieStore.set('access_token', '', { maxAge: 0, path: '/' });
      cookieStore.set('refresh_token', '', { maxAge: 0, path: '/' });
      cookieStore.set('refresh_token', '', { maxAge: 0, path: '/api/auth/refresh' });

      return NextResponse.json(
        { success: false, error: { code: 401, message: 'Refresh token expired' } },
        { status: 401 }
      );
    }

    const data = await backendResponse.json();

    // Set new access token cookie
    cookieStore.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_TTL,
    });

    // Rotate refresh token cookie
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

    return NextResponse.json({ success: true });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: { code: 504, message: 'Refresh request timed out' } },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

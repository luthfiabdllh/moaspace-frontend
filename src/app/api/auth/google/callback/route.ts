import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 604800);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const token = searchParams.get('token');
  const refresh = searchParams.get('refresh');
  const code = searchParams.get('code');

  // NEXT_PUBLIC_APP_URL takes priority: in the standalone Docker server
  // (HOSTNAME=0.0.0.0), request.nextUrl.origin resolves to the server's own
  // bind address (e.g. https://0.0.0.0:3000), not the Host header a reverse
  // proxy forwards — so it can't be trusted as the public-facing origin.
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3001';

  // 1. If Google returned an error directly
  if (error) {
    const msg = errorDescription || error || 'Login Google dibatalkan atau ditolak.';
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, origin));
  }

  // 2. If redirected from backend with already issued tokens
  if (token) {
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_TTL,
    });

    if (refresh) {
      cookieStore.set('refresh_token', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge: REFRESH_TOKEN_TTL,
      });
    }

    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  // 3. If Google redirected with authorization code
  if (code) {
    // Must match exactly whatever redirect_uri /api/auth/google used to
    // start the flow (same GOOGLE_CALLBACK_URL override, same dynamic
    // origin fallback) — Google rejects the token exchange otherwise.
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${origin}/api/auth/google/callback`;

    try {
      const backendRes = await fetch(`${BACKEND_API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': request.headers.get('user-agent') || 'MoaSpace-Frontend',
        },
        body: JSON.stringify({
          code,
          redirectUri,
        }),
      });

      if (!backendRes.ok) {
        const errData = await backendRes.json().catch(() => null);
        const errorMsg =
          errData?.error?.message ||
          errData?.message ||
          'Email Google Anda belum didaftarkan oleh Super Admin. Sistem ini bersifat tertutup.';

        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, origin));
      }

      const data = await backendRes.json();

      const cookieStore = await cookies();
      cookieStore.set('access_token', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_TOKEN_TTL,
      });

      if (data.refreshToken) {
        cookieStore.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/api/auth/refresh',
          maxAge: REFRESH_TOKEN_TTL,
        });
      }

      return NextResponse.redirect(new URL('/dashboard', origin));
    } catch {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Gagal menghubungi server autentikasi.')}`,
          origin
        )
      );
    }
  }

  // No code, no token
  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent('Parameter otorisasi Google tidak lengkap.')}`,
      origin
    )
  );
}

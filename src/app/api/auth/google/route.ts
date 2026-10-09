import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { googleAuthSchema } from '@/features/auth/types';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 604800);

export async function GET(request: NextRequest) {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Google Client ID belum dikonfigurasi di server.' } },
      { status: 500 }
    );
  }

  // NEXT_PUBLIC_APP_URL takes priority: in the standalone Docker server
  // (HOSTNAME=0.0.0.0), request.nextUrl.origin resolves to the server's own
  // bind address (e.g. https://0.0.0.0:3000), not the Host header a reverse
  // proxy forwards — so it can't be trusted as the public-facing origin.
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3001';
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${origin}/api/auth/google/callback`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 400, message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const parsed = googleAuthSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 422,
          message: 'ID token Google tidak valid',
          issues: parsed.error.issues,
        },
      },
      { status: 422 }
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    if (!backendResponse.ok) {
      const errData = await backendResponse.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: backendResponse.status,
            message:
              errData?.error?.message ||
              errData?.message ||
              'Akun Google belum didaftarkan oleh Super Admin KKN.',
          },
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

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

    return NextResponse.json({
      success: true,
      data: { user: data.user },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Gagal menghubungi server' } },
      { status: 500 }
    );
  }
}

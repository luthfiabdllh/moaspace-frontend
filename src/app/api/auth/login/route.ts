import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginSchema } from '@/features/auth/types';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 86400); // 1 hari (default)
const REFRESH_TOKEN_REMEMBER_TTL = Number(process.env.REFRESH_TOKEN_REMEMBER_TTL ?? 2592000); // 30 hari (remember me)

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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 422,
          message: 'Validasi form gagal',
          issues: parsed.error.issues,
        },
      },
      { status: 422 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      const errData = await backendResponse.json().catch(() => null);
      const message =
        errData?.error?.message ||
        errData?.message ||
        (backendResponse.status === 401 ? 'Email atau kata sandi salah' : 'Gagal menghubungi server');

      return NextResponse.json(
        {
          success: false,
          error: {
            code: backendResponse.status,
            message,
          },
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Set httpOnly cookies
    const cookieStore = await cookies();

    cookieStore.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_TTL,
    });

    if (data.refreshToken) {
      const isRememberMe = Boolean(parsed.data.rememberMe);
      const refreshTokenTtl = isRememberMe ? REFRESH_TOKEN_REMEMBER_TTL : REFRESH_TOKEN_TTL;

      cookieStore.set('refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: refreshTokenTtl,
      });
    }

    return NextResponse.json({
      success: true,
      data: { user: data.user },
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: { code: 504, message: 'Permintaan ke backend timed out' } },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

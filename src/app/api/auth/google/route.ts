import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { googleAuthSchema } from '@/features/auth/types';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 604800);

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

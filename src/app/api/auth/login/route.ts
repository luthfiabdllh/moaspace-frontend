import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginSchema } from '@/features/auth/types';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8000';
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL ?? 604800);

/**
 * POST /api/auth/login
 *
 * BFF Proxy Route Handler — validates request, proxies to backend,
 * then sets httpOnly cookies. The client NEVER receives the tokens directly.
 */
export async function POST(request: NextRequest) {
  // ── Parse & validate body ──────────────────────────────────────────────
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
          message: 'Validation failed',
          issues: parsed.error.issues,
        },
      },
      { status: 422 }
    );
  }

  // ── Proxy to backend with timeout ─────────────────────────────────────
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
      const status = backendResponse.status;
      if (status === 401) {
        return NextResponse.json(
          { success: false, error: { code: 401, message: 'Invalid credentials' } },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: { code: 502, message: 'Upstream service error' } },
        { status: 502 }
      );
    }

    const data = await backendResponse.json();

    // ── Set httpOnly cookies — tokens NEVER returned to client JS ─────
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
        // Restrict refresh token to ONLY the refresh endpoint
        path: '/api/auth/refresh',
        maxAge: REFRESH_TOKEN_TTL,
      });
    }

    // Return user data without tokens
    return NextResponse.json({
      success: true,
      data: { user: data.user },
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: { code: 504, message: 'Backend request timed out' } },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

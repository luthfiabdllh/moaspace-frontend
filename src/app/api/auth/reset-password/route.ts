import { type NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/features/auth/types';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';

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

  const parsed = resetPasswordSchema.safeParse(body);
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

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: parsed.data.token,
        password: parsed.data.password,
      }),
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
              'Reset kata sandi gagal. Token tidak valid atau kedaluwarsa.',
          },
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Gagal menghubungi server' } },
      { status: 500 }
    );
  }
}

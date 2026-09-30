import { type NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/features/auth/types';

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 422,
          message: 'Format email tidak valid',
          issues: parsed.error.issues,
        },
      },
      { status: 422 }
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Gagal menghubungi server' } },
      { status: 500 }
    );
  }
}

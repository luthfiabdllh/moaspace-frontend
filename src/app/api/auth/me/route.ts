import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 401, message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: res.status,
            message: err?.message || 'Gagal mengambil data profil',
          },
        },
        { status: res.status }
      );
    }

    const user = await res.json();
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Gagal menghubungi server' } },
      { status: 500 }
    );
  }
}

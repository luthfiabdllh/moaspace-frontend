import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 401, message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  try {
    const { search } = new URL(req.url);
    const res = await fetch(`${BACKEND_API_URL}/divisions/${id}/board${search}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Gagal menghubungi server' } },
      { status: 500 }
    );
  }
}

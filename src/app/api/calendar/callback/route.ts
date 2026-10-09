import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const code = searchParams.get('code');

  const origin =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3001';

  if (error) {
    const msg = errorDescription || error || 'Otorisasi Google Calendar dibatalkan atau ditolak.';
    return NextResponse.redirect(new URL(`/profile?calendar_error=${encodeURIComponent(msg)}`, origin));
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/profile?calendar_error=Kode+otorisasi+Google+tidak+ditemukan', origin)
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL('/login?error=Sesi+Anda+telah+berakhir,+silakan+login+kembali', origin)
    );
  }

  const redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URL || `${origin}/api/calendar/callback`;

  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/calendar/callback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, redirectUri }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      const errMsg = data?.message || data?.error?.message || 'Gagal menghubungkan Google Calendar.';
      return NextResponse.redirect(
        new URL(`/profile?calendar_error=${encodeURIComponent(errMsg)}`, origin)
      );
    }

    return NextResponse.redirect(
      new URL('/profile?calendar_connected=success', origin)
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        `/profile?calendar_error=${encodeURIComponent('Gagal menghubungi server untuk verifikasi kalender.')}`,
        origin
      )
    );
  }
}

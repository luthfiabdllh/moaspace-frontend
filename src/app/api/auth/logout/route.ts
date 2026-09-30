import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 *
 * Clears all auth cookies. Called by the `useLogout` mutation.
 * This is a Server Action pattern alternative — the client calls this
 * BFF endpoint which then clears httpOnly cookies the client cannot touch.
 */
export async function POST() {
  const cookieStore = await cookies();

  // Clear access token
  cookieStore.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });

  // Clear refresh token
  cookieStore.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}

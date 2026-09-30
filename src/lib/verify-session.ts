import 'server-only';
import { jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'your-secret-key-change-me-in-production-min-32-chars'
);

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  name?: string;
  isSuperAdmin?: boolean;
  role?: string;
}

/**
 * Performs AUTHORITATIVE JWT verification — signature + expiry.
 *
 * Call this from Server Components and Route Handlers.
 * NEVER call from proxy.ts (use cookie existence check there instead).
 */
export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch {
    // Token is expired, tampered, or otherwise invalid
    return null;
  }
}

import 'server-only';
import { jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-key-change-in-production-32c'
);

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Performs AUTHORITATIVE JWT verification — signature + expiry.
 *
 * Call this from Server Components and Route Handlers.
 * NEVER call from proxy.ts (use cookie existence check there instead).
 *
 * Returns the decoded payload on success, or null if the token is:
 * - Missing
 * - Expired
 * - Has an invalid signature
 *
 * @example
 * ```tsx
 * // In a Server Component or layout:
 * const session = await verifySession();
 * if (!session) redirect('/login');
 * ```
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

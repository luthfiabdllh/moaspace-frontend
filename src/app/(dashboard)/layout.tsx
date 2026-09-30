import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout — AUTHORITATIVE auth check.
 *
 * This is the second layer of the two-layer auth pattern:
 * 1. proxy.ts: thin check — only verifies cookie existence
 * 2. THIS layout: cryptographic JWT verification via jose
 */
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  );
}

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { DashboardHeader } from '@/components/layouts/dashboard-header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout — AUTHORITATIVE auth check and global layout shell.
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

  const roleName = session.isSuperAdmin
    ? 'Super Admin'
    : session.isKormanit
      ? 'Koordinator Mahasiswa Unit'
      : 'Anggota';
  const userName = typeof session.name === 'string' ? session.name : roleName;

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader userName={userName} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-background"
          aria-label="Konten Utama"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { AppShell } from '@/components/sidebar-02';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout — AUTHORITATIVE auth check and global layout shell.
 *
 * Fully integrated with @blocks-so/sidebar-02 application shell:
 * - SidebarProvider, collapsible Sidebar, and SidebarInset
 * - Dynamic breadcrumbs, division switcher, and role-based navigation
 * - Dark & light mode toggle and accessible user sign-out
 */
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await verifySession();

  if (!session) {
    // Redirect via a route handler that clears the (possibly present but
    // invalid) access_token cookie first — redirecting straight to /login
    // here would leave a stale cookie behind, which proxy.ts's cheap
    // existence-only check would then bounce back to /dashboard forever.
    redirect('/api/auth/session-expired');
  }

  const roleName = session.isSuperAdmin
    ? 'Super Admin'
    : session.isKormanit
      ? 'Koordinator Mahasiswa Unit'
      : 'Anggota';
  const userName = typeof session.name === 'string' ? session.name : roleName;

  return (
    <AppShell userName={userName} roleName={roleName}>
      {children}
    </AppShell>
  );
}

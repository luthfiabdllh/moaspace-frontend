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
    redirect('/login');
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

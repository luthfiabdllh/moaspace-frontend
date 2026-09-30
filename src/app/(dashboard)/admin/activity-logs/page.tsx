import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { ActivityLogsPageContent } from '@/features/activity-logs/components/activity-logs-page-content';

export const metadata = {
  title: 'Activity Log (Audit Perubahan) | MoaSpace',
  description: 'Riwayat audit lengkap pencatatan penempatan anggota, perubahan role, dan mutasi akun.',
};

export default async function AdminActivityLogsPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  // Authoritative check: only Super Admin or Koordinator Mahasiswa Unit can access
  if (!session.isSuperAdmin && !session.isKormanit) {
    redirect('/dashboard');
  }

  const roleName = session.isSuperAdmin
    ? 'Super Admin'
    : 'Koordinator Mahasiswa Unit';
  const userName = typeof session.name === 'string' ? session.name : roleName;

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader userName={userName} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6"
          aria-label="Activity Logs main content"
        >
          <ActivityLogsPageContent />
        </main>
      </div>
    </div>
  );
}

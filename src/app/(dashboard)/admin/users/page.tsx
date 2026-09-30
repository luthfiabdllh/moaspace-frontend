import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { UsersPageContent } from '@/features/users/components/users-page-content';

export const metadata = {
  title: 'Kelola Anggota | MoaSpace',
  description: 'Kelola pendaftaran anggota KKN, penempatan divisi, dan status akun.',
};

export default async function AdminUsersPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  // Authoritative Super Admin check: only super admin can access this page
  if (!session.isSuperAdmin) {
    redirect('/dashboard');
  }

  const userName = typeof session.name === 'string' ? session.name : 'Super Admin';

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader userName={userName} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6"
          aria-label="Admin Anggota main content"
        >
          <UsersPageContent />
        </main>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { ProfilePageContent } from '@/features/profile/components/profile-page-content';

export const metadata = {
  title: 'Profil Pengguna | MoaSpace',
  description: 'Kelola identitas, wewenang divisi, dan keamanan akun Anda di MoaSpace.',
};

export default async function ProfilePage() {
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
          className="flex-1 overflow-y-auto p-6 bg-background"
          aria-label="Profile main content"
        >
          <ProfilePageContent />
        </main>
      </div>
    </div>
  );
}

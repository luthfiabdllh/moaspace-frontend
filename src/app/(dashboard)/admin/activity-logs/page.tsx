import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
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

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <ActivityLogsPageContent />
    </div>
  );
}

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { DivisionsPageContent } from '@/features/divisions/components/divisions-page-content';

export const metadata = {
  title: 'Manajemen Divisi KKN | MoaSpace',
  description: 'Kelola divisi kerja, penunjukan koordinator divisi, dan pengaturan approval request.',
};

export default async function AdminDivisionsPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/api/auth/session-expired');
  }

  // Authoritative check: only Super Admin or Koordinator Mahasiswa Unit can access
  if (!session.isSuperAdmin && !session.isKormanit) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <DivisionsPageContent />
    </div>
  );
}

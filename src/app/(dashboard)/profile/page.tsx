import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
import { ProfilePageContent } from '@/features/profile/components/profile-page-content';

export const metadata = {
  title: 'Profil Pengguna | MoaSpace',
  description: 'Kelola identitas, wewenang divisi, dan keamanan akun Anda di MoaSpace.',
};

export default async function ProfilePage() {
  const session = await verifySession();

  if (!session) {
    redirect('/api/auth/session-expired');
  }

  return (
    <div className="w-full min-w-0 pb-8 space-y-6">
      <ProfilePageContent />
    </div>
  );
}

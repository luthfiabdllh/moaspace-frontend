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
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <ProfilePageContent />
    </div>
  );
}

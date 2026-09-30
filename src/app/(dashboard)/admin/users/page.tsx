import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/verify-session';
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

  // Authoritative check: only Super Admin or Kormanit can access this page
  if (!session.isSuperAdmin && !session.isKormanit) {
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <UsersPageContent />
    </div>
  );
}

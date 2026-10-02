import type { Metadata } from 'next';
import Link from 'next/link';
import { ActivateForm } from '@/features/auth/components/activate-form';
import {
  AuthSplitLayout,
  DEFAULT_HERO_IMAGE,
} from '@/components/ui/sign-in';

export const metadata: Metadata = {
  title: 'Aktivasi Akun Anggota | MoaSpace',
  description: 'Aktivasi akun anggota baru tim KKN',
};

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <AuthSplitLayout
      title={
        <span>
          <span className="font-light text-foreground tracking-tighter">Aktivasi </span>
          <span className="font-semibold text-foreground tracking-tight">Akun Anggota</span>
        </span>
      }
      description="Buat kata sandi akun Anda untuk mulai mengelola task dan berkontribusi dalam tim KKN"
      heroImageSrc={DEFAULT_HERO_IMAGE}
    >
      {token ? (
        <ActivateForm token={token} />
      ) : (
        <div className="animate-element animate-delay-300 space-y-6 text-center py-4">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive leading-relaxed">
            Tautan aktivasi tidak valid atau tidak memiliki token verifikasi.
          </div>
          <p className="text-xs text-muted-foreground">
            Silakan periksa kembali tautan undangan aktivasi dari email Super Admin KKN.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      )}
    </AuthSplitLayout>
  );
}

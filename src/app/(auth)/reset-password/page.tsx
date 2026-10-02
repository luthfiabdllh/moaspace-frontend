import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import {
  AuthSplitLayout,
  DEFAULT_HERO_IMAGE,
} from '@/components/ui/sign-in';

export const metadata: Metadata = {
  title: 'Reset Kata Sandi | MoaSpace',
  description: 'Atur ulang kata sandi akun MoaSpace',
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <AuthSplitLayout
      title={
        <span>
          <span className="font-light text-foreground tracking-tighter">Atur Ulang </span>
          <span className="font-semibold text-foreground tracking-tight">Kata Sandi</span>
        </span>
      }
      description="Masukkan kata sandi baru untuk mengamankan akun MoaSpace Anda"
      heroImageSrc={DEFAULT_HERO_IMAGE}
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="animate-element animate-delay-300 space-y-6 text-center py-4">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive leading-relaxed">
            Tautan reset kata sandi tidak valid atau tidak memiliki token verifikasi.
          </div>
          <p className="text-xs text-muted-foreground">
            Silakan minta tautan baru melalui halaman lupa kata sandi.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/forgot-password"
              className="w-full inline-flex items-center justify-center rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Minta Tautan Baru
            </Link>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center rounded-2xl border border-border py-4 font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      )}
    </AuthSplitLayout>
  );
}

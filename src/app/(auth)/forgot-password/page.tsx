import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import {
  AuthSplitLayout,
  DEFAULT_HERO_IMAGE,
} from '@/components/ui/sign-in';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi | MoaSpace',
  description: 'Minta tautan reset kata sandi akun MoaSpace',
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      title={
        <span>
          <span className="font-light text-foreground tracking-tighter">Reset </span>
          <span className="font-semibold text-foreground tracking-tight">Password</span>
        </span>
      }
      description="Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi akun MoaSpace"
      heroImageSrc={DEFAULT_HERO_IMAGE}
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}

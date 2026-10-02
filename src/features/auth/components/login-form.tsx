'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { loginSchema, type LoginDTO } from '../types';
import { useLogin } from '../api/use-mutations';
import { getPostLoginRedirect } from '../utils';
import {
  SignInPage,
  DEFAULT_HERO_IMAGE,
} from '@/components/ui/sign-in';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const queryError = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    queryError ? decodeURIComponent(queryError) : null
  );
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginDTO) => {
    setErrorMessage(null);
    try {
      const result = await loginMutation.mutateAsync(data);

      if (result.success && result.data?.user) {
        toast.success(`Selamat datang kembali, ${result.data.user.name}!`);
        const targetPath = getPostLoginRedirect(result.data.user);
        router.push(targetPath);
        router.refresh();
      } else {
        const msg = result.error?.message ?? 'Email atau kata sandi tidak valid.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem. Silakan coba lagi.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMessage(null);
    setIsGoogleRedirecting(true);
    // Initiates Google OAuth 2.0 flow via BFF route handler
    window.location.href = '/api/auth/google';
  };

  const handleCreateAccount = () => {
    toast.info(
      'Pendaftaran akun anggota KKN dilakukan secara tertutup oleh Super Admin. Silakan hubungi Super Admin divisi Anda.',
      { duration: 6000 }
    );
  };

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <SignInPage
      title={
        <span>
          <span className="font-light text-foreground tracking-tighter">Welcome to </span>
          <span className="font-semibold text-foreground tracking-tight">MoaSpace</span>
        </span>
      }
      description="Sistem Pelacak Kerja & Story Point Tim KKN"
      heroImageSrc={DEFAULT_HERO_IMAGE}
      errorMessage={errorMessage}
      isLoading={isPending}
      isGoogleLoading={isGoogleRedirecting}
      emailError={errors.email?.message}
      passwordError={errors.password?.message}
      emailProps={register('email')}
      passwordProps={register('password')}
      onSignIn={handleSubmit(onSubmit)}
      onGoogleSignIn={handleGoogleLogin}
      onResetPassword={() => router.push('/forgot-password')}
      onCreateAccount={handleCreateAccount}
      footerNotice={
        <div className="animate-element animate-delay-900 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Belum memiliki akun?{' '}
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-violet-400 hover:underline cursor-pointer font-medium"
            >
              Hubungi Super Admin KKN
            </button>
          </p>
        </div>
      }
    />
  );
}

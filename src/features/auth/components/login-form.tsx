'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

import { loginSchema, type LoginDTO } from '../types';
import { useLogin } from '../api/use-mutations';
import { getPostLoginRedirect } from '../utils';
import {
  SignInPage,
  DEFAULT_HERO_IMAGE,
} from '@/components/ui/sign-in';

function parseQueryError(errParam: string | null): string | null {
  if (!errParam) return null;
  const decoded = decodeURIComponent(errParam);
  if (decoded === 'unregistered_email' || decoded === 'AccessDenied') {
    return 'Email Google Anda belum terdaftar dalam sistem tertutup KKN MoaSpace. Silakan hubungi Super Admin untuk didaftarkan.';
  }
  if (decoded === 'missing_code') {
    return 'Proses masuk dengan Google dibatalkan atau tidak lengkap.';
  }
  if (decoded === 'session_expired') {
    return 'Sesi masuk Anda telah berakhir. Silakan masuk kembali.';
  }
  return decoded;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const queryError = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    parseQueryError(queryError)
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
      rememberMe: false,
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
        toast.error('Gagal Masuk', {
          description: msg,
        });
      }
    } catch (err: unknown) {
      let message = 'Terjadi kendala saat menghubungkan ke sistem. Silakan coba lagi.';
      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          (err.response?.status === 401
            ? 'Email atau kata sandi yang Anda masukkan salah.'
            : err.response?.status === 403
              ? 'Akun Anda dinonaktifkan atau belum diaktivasi.'
              : err.response?.status === 429
                ? 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu beberapa saat.'
                : 'Gagal terhubung ke server autentikasi.');
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessage(message);
      toast.error('Autentikasi Gagal', {
        description: message,
      });
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

  const emailRegistration = register('email', {
    onChange: () => {
      if (errorMessage) setErrorMessage(null);
    },
  });

  const passwordRegistration = register('password', {
    onChange: () => {
      if (errorMessage) setErrorMessage(null);
    },
  });

  const rememberMeRegistration = register('rememberMe');

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
      onDismissError={() => setErrorMessage(null)}
      isLoading={isPending}
      isGoogleLoading={isGoogleRedirecting}
      emailError={errors.email?.message}
      passwordError={errors.password?.message}
      emailProps={emailRegistration}
      passwordProps={passwordRegistration}
      rememberMeProps={rememberMeRegistration}
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

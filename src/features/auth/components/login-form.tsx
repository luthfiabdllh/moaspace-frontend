'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

import { loginSchema, type LoginDTO } from '../types';
import { useLogin, useGoogleLogin } from '../api/use-mutations';
import { getPostLoginRedirect } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleMockGoogleLogin = async () => {
    setErrorMessage(null);
    try {
      // In local dev, use the super admin email for mock google login
      const result = await googleLoginMutation.mutateAsync({
        idToken: 'mock-google-token:admin@moaspace.com',
      });

      if (result.success && result.data?.user) {
        toast.success(`Login Google berhasil! Selamat datang, ${result.data.user.name}.`);
        const targetPath = getPostLoginRedirect(result.data.user);
        router.push(targetPath);
        router.refresh();
      } else {
        const msg = result.error?.message ?? 'Akun Google tidak terdaftar dalam sistem.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login Google gagal.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const isPending = isSubmitting || loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

      {/* Google SSO Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2.5 h-10 border-input hover:bg-accent"
        onClick={handleMockGoogleLogin}
        disabled={isPending}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
          />
        </svg>
        <span>Masuk dengan Google</span>
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">atau dengan email</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Login form"
        noValidate
        className="space-y-4"
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="login-email">Alamat Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              id="login-email"
              type="email"
              placeholder="nama@moaspace.com"
              autoComplete="email"
              autoFocus
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className={cn('pl-9', errors.email && 'border-destructive')}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Kata Sandi</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline underline-offset-4"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={cn('pl-9', errors.password && 'border-destructive')}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          id="login-submit"
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-label={isPending ? 'Memproses...' : 'Masuk ke MoaSpace'}
        >
          {isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {isPending ? 'Memproses...' : 'Masuk ke MoaSpace'}
        </Button>
      </form>
    </div>
  );
}

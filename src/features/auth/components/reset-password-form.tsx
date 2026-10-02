'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { resetPasswordSchema, type ResetPasswordDTO } from '../types';
import { useResetPassword } from '../api/use-mutations';
import { GlassInputWrapper } from '@/components/ui/sign-in';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const resetMutation = useResetPassword();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordDTO) => {
    setErrorMessage(null);
    try {
      const result = await resetMutation.mutateAsync(data);

      if (result.success) {
        toast.success(result.message || 'Kata sandi berhasil direset! Silakan masuk.');
        router.push('/login');
      } else {
        setErrorMessage('Gagal mereset kata sandi. Token tidak valid.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Token reset kata sandi tidak valid atau telah kedaluwarsa.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const isPending = isSubmitting || resetMutation.isPending;

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div
          role="alert"
          className="animate-element animate-delay-200 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Reset password form"
        noValidate
        className="space-y-5"
      >
        <input type="hidden" {...register('token')} value={token} />

        {/* New Password */}
        <div className="animate-element animate-delay-300">
          <label htmlFor="reset-password" className="text-sm font-medium text-muted-foreground block mb-2">
            Kata Sandi Baru
          </label>
          <GlassInputWrapper className={errors.password ? 'border-destructive/70' : ''}>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                autoFocus
                aria-required="true"
                aria-invalid={!!errors.password}
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide visibility' : 'Show visibility'}
                className="absolute inset-y-0 right-3 flex items-center p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </GlassInputWrapper>
          {errors.password && (
            <p role="alert" className="text-xs text-destructive mt-1.5 px-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="animate-element animate-delay-400">
          <label htmlFor="reset-confirm-password" className="text-sm font-medium text-muted-foreground block mb-2">
            Konfirmasi Kata Sandi
          </label>
          <GlassInputWrapper className={errors.confirmPassword ? 'border-destructive/70' : ''}>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi kata sandi baru"
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!errors.confirmPassword}
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide visibility' : 'Show visibility'}
                className="absolute inset-y-0 right-3 flex items-center p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </GlassInputWrapper>
          {errors.confirmPassword && (
            <p role="alert" className="text-xs text-destructive mt-1.5 px-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          id="reset-submit"
          type="submit"
          disabled={isPending}
          className="animate-element animate-delay-500 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />}
          <span>{isPending ? 'Menyimpan kata sandi...' : 'Ubah Kata Sandi'}</span>
        </button>

        <div className="animate-element animate-delay-600 pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

import { resetPasswordSchema, type ResetPasswordDTO } from '../types';
import { useResetPassword } from '../api/use-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const resetMutation = useResetPassword();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Reset password form"
        noValidate
        className="space-y-4"
      >
        <input type="hidden" {...register('token')} value={token} />

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="reset-password">Kata Sandi Baru</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              id="reset-password"
              type="password"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              autoFocus
              aria-required="true"
              aria-invalid={!!errors.password}
              className={cn('pl-9', errors.password && 'border-destructive')}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p role="alert" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="reset-confirm-password">Konfirmasi Kata Sandi</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              id="reset-confirm-password"
              type="password"
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              className={cn('pl-9', errors.confirmPassword && 'border-destructive')}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          id="reset-submit"
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {isPending ? 'Menyimpan kata sandi...' : 'Ubah Kata Sandi'}
        </Button>

        <div className="pt-1 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

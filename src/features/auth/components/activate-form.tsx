'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

import { activateSchema, type ActivateDTO } from '../types';
import { useActivate } from '../api/use-mutations';
import { getPostLoginRedirect } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ActivateFormProps {
  token: string;
}

export function ActivateForm({ token }: ActivateFormProps) {
  const router = useRouter();
  const activateMutation = useActivate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivateDTO>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ActivateDTO) => {
    setErrorMessage(null);
    try {
      const result = await activateMutation.mutateAsync(data);

      if (result.success && result.data?.user) {
        toast.success(`Aktivasi berhasil! Selamat datang, ${result.data.user.name}.`);
        const targetPath = getPostLoginRedirect(result.data.user);
        router.push(targetPath);
        router.refresh();
      } else {
        const msg =
          result.error?.message ??
          'Aktivasi gagal. Token tidak valid atau telah kedaluwarsa.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat aktivasi akun.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const isPending = isSubmitting || activateMutation.isPending;

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <CheckCircle2 size={16} className="text-primary shrink-0" />
        <span>Token aktivasi terverifikasi. Buat kata sandi baru untuk mulai bekerja.</span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Activate account form"
        noValidate
        className="space-y-4"
      >
        <input type="hidden" {...register('token')} value={token} />

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="activate-password">Kata Sandi Baru</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              id="activate-password"
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
          <Label htmlFor="activate-confirm-password">Konfirmasi Kata Sandi</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              id="activate-confirm-password"
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

        {/* Submit */}
        <Button
          id="activate-submit"
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {isPending ? 'Mengaktivasi akun...' : 'Aktifkan Akun & Masuk'}
        </Button>
      </form>
    </div>
  );
}

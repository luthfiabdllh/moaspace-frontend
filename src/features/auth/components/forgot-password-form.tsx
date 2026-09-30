'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { forgotPasswordSchema, type ForgotPasswordDTO } from '../types';
import { useForgotPassword } from '../api/use-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm() {
  const forgotMutation = useForgotPassword();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordDTO>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordDTO) => {
    try {
      await forgotMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Permintaan reset kata sandi telah diproses.');
    } catch {
      toast.error('Gagal mengirim permintaan. Silakan coba lagi.');
    }
  };

  const isPending = isSubmitting || forgotMutation.isPending;

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center py-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Periksa Email Anda</h3>
          <p className="text-sm text-muted-foreground">
            Jika <span className="font-medium text-foreground">{submittedEmail}</span> terdaftar
            dan berstatus aktif, link untuk reset kata sandi telah dikirimkan.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Kembali ke Halaman Masuk
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Forgot password form"
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Alamat Email Terdaftar</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
          <Input
            id="forgot-email"
            type="email"
            placeholder="nama@moaspace.com"
            autoComplete="email"
            autoFocus
            aria-required="true"
            aria-invalid={!!errors.email}
            className={cn('pl-9', errors.email && 'border-destructive')}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        id="forgot-submit"
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {isPending ? 'Mengirim...' : 'Kirim Link Reset Kata Sandi'}
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
  );
}

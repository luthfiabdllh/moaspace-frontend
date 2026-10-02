'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { forgotPasswordSchema, type ForgotPasswordDTO } from '../types';
import { useForgotPassword } from '../api/use-mutations';
import { GlassInputWrapper } from '@/components/ui/sign-in';

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
      <div className="animate-element animate-delay-300 space-y-6 text-center py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-xl text-foreground">Periksa Email Anda</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jika <span className="font-medium text-foreground">{submittedEmail}</span> terdaftar
            dan berstatus aktif, tautan untuk reset kata sandi telah dikirimkan ke kotak masuk Anda.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center rounded-2xl border border-border py-4 font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Kembali ke Halaman Masuk
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
      className="space-y-5"
    >
      <div className="animate-element animate-delay-300">
        <label htmlFor="forgot-email" className="text-sm font-medium text-muted-foreground block mb-2">
          Alamat Email Terdaftar
        </label>
        <GlassInputWrapper className={errors.email ? 'border-destructive/70' : ''}>
          <input
            id="forgot-email"
            type="email"
            placeholder="nama@moaspace.com"
            autoComplete="email"
            autoFocus
            aria-required="true"
            aria-invalid={!!errors.email}
            className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground"
            {...register('email')}
          />
        </GlassInputWrapper>
        {errors.email && (
          <p role="alert" className="text-xs text-destructive mt-1.5 px-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        id="forgot-submit"
        type="submit"
        disabled={isPending}
        className="animate-element animate-delay-500 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />}
        <span>{isPending ? 'Mengirim...' : 'Kirim Link Reset Kata Sandi'}</span>
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
  );
}

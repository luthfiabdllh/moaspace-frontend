import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi | MoaSpace',
  description: 'Minta tautan reset kata sandi akun MoaSpace',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-sm">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Lupa Kata Sandi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan email terdaftar untuk menerima tautan pemulihan
          </p>
        </div>

        <Card className="shadow-md border-border/80">
          <CardContent className="pt-6">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

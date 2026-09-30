import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Masuk | MoaSpace Task Tracker KKN',
  description: 'Masuk ke akun MoaSpace tim KKN Anda',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-sm">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            MoaSpace KKN
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistem Pelacak Kerja & Story Point Tim KKN
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-md border-border/80">
          <CardHeader className="sr-only">
            <h2>Formulir Masuk</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Memuat formulir...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Notice for KKN Members */}
        <p className="text-center text-xs text-muted-foreground">
          Belum memiliki akun? Hubungi <span className="font-medium text-foreground">Super Admin KKN</span> untuk didaftarkan ke divisi Anda.
        </p>
      </div>
    </main>
  );
}

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Masuk | MoaSpace Task Tracker KKN',
  description: 'Masuk ke akun MoaSpace tim KKN Anda',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
            Memuat formulir masuk...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Reset Kata Sandi | MoaSpace',
  description: 'Atur ulang kata sandi akun MoaSpace',
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-sm">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Atur Ulang Kata Sandi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan kata sandi baru untuk akun Anda
          </p>
        </div>

        <Card className="shadow-md border-border/80">
          <CardContent className="pt-6">
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-destructive font-medium">
                  Tautan reset kata sandi tidak valid atau tidak memiliki token.
                </p>
                <div className="pt-2">
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full">
                      Minta Tautan Baru
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

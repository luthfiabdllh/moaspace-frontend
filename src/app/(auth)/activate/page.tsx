import type { Metadata } from 'next';
import Link from 'next/link';
import { ActivateForm } from '@/features/auth/components/activate-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Aktivasi Akun Anggota | MoaSpace',
  description: 'Aktivasi akun anggota baru tim KKN',
};

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
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
            Aktivasi Akun Anggota
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat kata sandi akun Anda untuk mulai mengelola task KKN
          </p>
        </div>

        <Card className="shadow-md border-border/80">
          <CardContent className="pt-6">
            {token ? (
              <ActivateForm token={token} />
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-destructive font-medium">
                  Tautan aktivasi tidak valid atau tidak memiliki token.
                </p>
                <p className="text-xs text-muted-foreground">
                  Silakan periksa kembali email undangan aktivasi dari Super Admin KKN.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Kembali ke Halaman Masuk
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

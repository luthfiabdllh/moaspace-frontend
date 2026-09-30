import { Users, Layers, Award, Info, Sparkles } from 'lucide-react';
import type { User } from '@/features/auth/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileDivisionsCardProps {
  user: User;
}

export function ProfileDivisionsCard({ user }: ProfileDivisionsCardProps) {
  const divisions = user.divisions ?? [];

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Layers className="size-4" />
          </div>
          <div>
            <CardTitle>Keanggotaan & Peran Divisi</CardTitle>
            <CardDescription>
              Daftar divisi kerja dan wewenang yang Anda miliki saat ini
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {divisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-border/80 bg-muted/20">
            <div className="p-3 rounded-full bg-muted mb-2 text-muted-foreground">
              <Users className="size-6" />
            </div>
            <p className="font-medium text-foreground">Belum Terdaftar di Divisi</p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Akun Anda belum ditempatkan dalam divisi kerja manapun. Hubungi Super Admin atau Koordinator Mahasiswa Unit jika Anda memerlukan penugasan divisi.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {divisions.map((div) => {
              const isCoordinator = div.role === 'COORDINATOR';

              return (
                <div
                  key={div.divisionId}
                  className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors shadow-2xs gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground line-clamp-1">
                        {div.divisionName}
                      </span>
                      {isCoordinator ? (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-950/40 border border-amber-500/20 text-xs gap-1">
                          <Award className="size-3" />
                          Koordinator
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Anggota
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      /{div.divisionSlug}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground border-t border-border/40 pt-2 flex items-center gap-1.5">
                    <Sparkles className="size-3 text-primary" />
                    <span>
                      {isCoordinator
                        ? 'Memiliki hak kelola tugas & arsip divisi ini'
                        : 'Dapat berkolaborasi & mengirim laporan divisi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <p>
            Satu pengguna dapat menjadi anggota aktif di beberapa divisi sekaligus dengan hak akses yang independen. Perubahan divisi dilakukan oleh pimpinan atau administrator.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

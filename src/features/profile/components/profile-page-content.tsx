'use client';

import { useCurrentUser } from '@/features/auth/api/use-queries';
import { ProfileInfoForm } from './profile-info-form';
import { ProfileDivisionsCard } from './profile-divisions-card';
import { ChangePasswordForm } from './change-password-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CheckCircle2, AlertTriangle, Sparkles, UserCheck, User } from 'lucide-react';

export function ProfilePageContent() {
  const { data: user, isLoading, isError, refetch } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data profil pengguna...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Gagal Memuat Profil</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Terjadi kendala saat mengambil data akun Anda. Pastikan sesi Anda masih aktif.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs font-medium text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto pb-10">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <span>Akun</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground font-semibold">Profil Pengguna</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <User className="size-6 text-primary" />
              Profil Pengguna
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Kelola identitas akun, tinjau penugasan divisi, dan atur keamanan kata sandi Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-muted/30"
            >
              <Shield className="size-3 text-primary" />
              {user.isSuperAdmin
                ? 'Super Admin'
                : user.isKormanit
                  ? 'Kormanit'
                  : 'Anggota Divisi'}
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
            >
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              {user.status === 'ACTIVE' ? 'Akun Aktif' : user.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left (Info & Divisions) | Right (Security & Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ProfileInfoForm user={user} />
          <ProfileDivisionsCard user={user} />
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ChangePasswordForm hasPassword={user.hasPassword ?? true} />

          {/* Account Security Overview Card */}
          <Card className="shadow-xs border-border/80 bg-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Shield className="size-4" />
                </div>
                <CardTitle className="text-sm">Status Keamanan Akun</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Tipe Autentikasi</span>
                <span className="font-medium text-foreground">
                  {user.googleLinked ? 'Google SSO & Sandi' : 'Kata Sandi Mandiri'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Tautan Google</span>
                {user.googleLinked ? (
                  <Badge variant="secondary" className="gap-1 border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Terhubung
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Belum Terhubung
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Status Anggota</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {user.status === 'ACTIVE' ? 'Aktif Terverifikasi' : 'Ditangguhkan'}
                </span>
              </div>

              <div className="pt-2 text-muted-foreground leading-relaxed flex items-start gap-2 bg-card p-3 rounded-lg border border-border/60">
                <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Aktivitas perubahan profil dan pembaruan kata sandi dicatat secara otomatis dalam log audit sistem untuk menjamin akuntabilitas seluruh anggota tim.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

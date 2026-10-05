'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Mail, Calendar, ShieldCheck, CheckCircle2, Loader2, Save } from 'lucide-react';
import type { User } from '@/features/auth/types';
import { updateProfileSchema, type UpdateProfileDTO } from '../types';
import { useUpdateProfile } from '../api/use-mutations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileInfoFormProps {
  user: User;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileDTO>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
    },
  });

  useEffect(() => {
    reset({ name: user.name });
  }, [user.name, reset]);

  const onSubmit = async (data: UpdateProfileDTO) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'U';

  const memberSince = user.createdAt
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
      }).format(new Date(user.createdAt))
    : 'Baru bergabung';

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <UserIcon className="size-4" />
          </div>
          <div>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              Kelola nama tampilan dan informasi identitas akun Anda
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Avatar & Badges Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
            <Avatar className="size-20 ring-2 ring-primary/20 shrink-0">
              <AvatarFallback className="bg-linear-to-tr from-primary to-indigo-600 text-white font-semibold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold text-lg text-foreground">{user.name}</span>
                {user.status === 'ACTIVE' ? (
                  <Badge variant="secondary" className="gap-1 border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="destructive">Nonaktif</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {user.isSuperAdmin && (
                  <Badge className="bg-red-600/90 text-white font-medium hover:bg-red-600">
                    <ShieldCheck className="size-3 mr-1" />
                    Super Admin
                  </Badge>
                )}
                {user.isKormanit && (
                  <Badge className="bg-indigo-600 text-white font-medium hover:bg-indigo-600">
                    <ShieldCheck className="size-3 mr-1" />
                    Koordinator Mahasiswa Unit
                  </Badge>
                )}
                {!user.isSuperAdmin && !user.isKormanit && (
                  <Badge variant="outline" className="font-medium text-muted-foreground">
                    Anggota MoaSpace
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nama Lengkap</Label>
              <Input
                id="profile-name"
                placeholder="Masukkan nama lengkap Anda"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-email"
                  value={user.email}
                  disabled
                  className="pl-9 bg-muted/50 cursor-not-allowed opacity-90"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email terdaftar dalam sistem tertutup MoaSpace dan tidak dapat diubah sendiri.
              </p>
            </div>

            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Bergabung sejak: {memberSince}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
            className="gap-2"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus, Loader2, Copy, Check } from 'lucide-react';

import { createUserSchema, type CreateUserDTO, type DivisionItem } from '../types';
import { useCreateUser } from '../api/use-mutations';
import { useSubunits } from '@/features/subunits/api/use-queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface CreateUserDialogProps {
  divisions: DivisionItem[];
}

export function CreateUserDialog({ divisions }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    name: string;
    email: string;
    activationUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const createUserMutation = useCreateUser();
  const { data: subunits = [] } = useSubunits();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserDTO>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      divisionId: divisions[0]?.id || '',
      role: 'MEMBER',
      cluster: undefined,
      isClusterCoordinator: false,
      subunitId: undefined,
      subunitRole: 'MEMBER',
    },
  });

  const divisionId = useWatch({ control, name: 'divisionId' });
  const role = useWatch({ control, name: 'role' });
  const cluster = useWatch({ control, name: 'cluster' });
  const isClusterCoordinator = useWatch({ control, name: 'isClusterCoordinator' });
  const subunitId = useWatch({ control, name: 'subunitId' });
  const subunitRole = useWatch({ control, name: 'subunitRole' });


  const onSubmit = async (data: CreateUserDTO) => {
    try {
      const res = await createUserMutation.mutateAsync(data);
      if (res.success) {
        setCreatedResult({
          name: data.name,
          email: data.email,
          activationUrl: res.activationUrl,
        });
        reset();
      }
    } catch {
      // error handled in mutation
    }
  };

  const handleCopyLink = () => {
    if (!createdResult?.activationUrl) return;
    navigator.clipboard.writeText(createdResult.activationUrl);
    setCopied(true);
    toast.success('Tautan aktivasi berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedResult(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setCreatedResult(null);
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus size={16} />
          <span>Daftarkan Anggota Baru</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daftarkan Anggota Tim KKN</DialogTitle>
          <DialogDescription>
            Super Admin mendaftarkan anggota dengan email, nama, penempatan divisi, dan role.
          </DialogDescription>
        </DialogHeader>

        {createdResult ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Check size={18} />
                <span>Anggota Berhasil Didaftarkan!</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Akun untuk <span className="font-semibold text-foreground">{createdResult.name}</span> ({createdResult.email}) telah dibuat.
                Kirimkan tautan aktivasi berikut agar anggota dapat membuat kata sandi:
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdResult.activationUrl}
                  className="text-xs font-mono bg-background"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  aria-label="Salin tautan"
                  className="shrink-0"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCreatedResult(null)}
              >
                Daftarkan Lagi
              </Button>
              <Button onClick={handleClose}>
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nama Lengkap Anggota</Label>
              <Input
                id="create-name"
                placeholder="Contoh: Budi Santoso"
                aria-invalid={!!errors.name}
                className={cn(errors.name && 'border-destructive')}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Alamat Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="Contoh: budi@moaspace.com"
                aria-invalid={!!errors.email}
                className={cn(errors.email && 'border-destructive')}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Divisi */}
            <div className="space-y-1.5">
              <Label htmlFor="create-division">Penempatan Divisi</Label>
              <Select value={divisionId} onValueChange={(v) => setValue('divisionId', v)}>
                <SelectTrigger
                  id="create-division"
                  className={cn('w-full h-10 text-sm', errors.divisionId && 'border-destructive')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.divisionId && (
                <p className="text-xs text-destructive">{errors.divisionId.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="create-role">Role Anggota</Label>
              <Select
                value={role}
                onValueChange={(v) => setValue('role', v as CreateUserDTO['role'])}
              >
                <SelectTrigger id="create-role" className="w-full h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Anggota Divisi</SelectItem>
                  <SelectItem value="COORDINATOR">Koordinator Divisi</SelectItem>
                  <SelectItem value="KOORDINATOR_MAHASISWA_UNIT">
                    Koordinator Mahasiswa Unit (Akses Penuh)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Klaster Keilmuan & Kormater */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
              <div className="text-xs font-semibold text-foreground">
                Dimensi 2: Klaster Keilmuan Mahasiswa
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-cluster" className="text-xs">Klaster</Label>
                <Select
                  value={cluster ?? 'NONE'}
                  onValueChange={(v) =>
                    setValue('cluster', v === 'NONE' ? undefined : (v as CreateUserDTO['cluster']))
                  }
                >
                  <SelectTrigger id="create-cluster" className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Klaster Keilmuan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Belum Ditentukan</SelectItem>
                    <SelectItem value="SAINTEK">🔵 Sains & Teknologi (Saintek)</SelectItem>
                    <SelectItem value="SOSHUM">🟢 Sosial & Humaniora (Soshum)</SelectItem>
                    <SelectItem value="MEDIKA">🔴 Medika & Kesehatan (Medika)</SelectItem>
                    <SelectItem value="AGRO">🟡 Agro & Pertanian (Agro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <Label htmlFor="create-kormater" className="text-xs font-medium cursor-pointer">
                    Koordinator Klaster (Kormater)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Tandai jika anggota ini adalah perwakilan koordinator klaster.
                  </p>
                </div>
                <Switch
                  id="create-kormater"
                  checked={Boolean(isClusterCoordinator)}
                  onCheckedChange={(val) => setValue('isClusterCoordinator', val)}
                />
              </div>
            </div>

            {/* Subunit Posko Penempatan */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
              <div className="text-xs font-semibold text-foreground">
                Dimensi 3: Wilayah Posko Subunit
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-subunit" className="text-xs">Subunit Posko</Label>
                <Select
                  value={subunitId ?? 'NONE'}
                  onValueChange={(v) =>
                    setValue('subunitId', v === 'NONE' ? undefined : v)
                  }
                >
                  <SelectTrigger id="create-subunit" className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pilih Posko Dusun..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Belum Ditempatkan</SelectItem>
                    {subunits.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.location ? `(${s.location})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subunitId && (
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="create-subunit-role" className="text-xs">Peran di Subunit</Label>
                  <Select
                    value={subunitRole ?? 'MEMBER'}
                    onValueChange={(v) =>
                      setValue('subunitRole', v as 'MEMBER' | 'COORDINATOR')
                    }
                  >
                    <SelectTrigger id="create-subunit-role" className="w-full h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Anggota Subunit</SelectItem>
                      <SelectItem value="COORDINATOR">
                        👑 Kormasit (Koordinator Mahasiswa Subunit)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>


            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || createUserMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createUserMutation.isPending}
              >
                {(isSubmitting || createUserMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Daftarkan Anggota
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

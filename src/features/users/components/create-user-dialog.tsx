'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus, Loader2, Copy, Check, Link as LinkIcon } from 'lucide-react';

import { createUserSchema, type CreateUserDTO, type DivisionItem } from '../types';
import { useCreateUser } from '../api/use-mutations';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserDTO>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      divisionId: divisions[0]?.id || '',
      role: 'MEMBER',
    },
  });

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
              <select
                id="create-division"
                className={cn(
                  'w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  errors.divisionId && 'border-destructive'
                )}
                {...register('divisionId')}
              >
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
              {errors.divisionId && (
                <p className="text-xs text-destructive">{errors.divisionId.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="create-role">Role di Divisi</Label>
              <select
                id="create-role"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('role')}
              >
                <option value="MEMBER">Member Divisi</option>
                <option value="COORDINATOR">Koordinator Divisi</option>
              </select>
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

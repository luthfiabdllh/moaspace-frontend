'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { createSubunitSchema, type CreateSubunitDTO } from '../types';
import { useCreateSubunit } from '../api/use-mutations';

interface CreateSubunitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSubunitDialog({
  open,
  onOpenChange,
}: CreateSubunitDialogProps) {
  const { mutate: createSubunit, isPending } = useCreateSubunit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubunitDTO>({
    resolver: zodResolver(createSubunitSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
    },
  });

  const onSubmit = (values: CreateSubunitDTO) => {
    createSubunit(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <MapPin className="size-4" />
            <span>Struktur Organisasi KKN</span>
          </div>
          <DialogTitle className="text-xl">Tambah Subunit / Posko Baru</DialogTitle>
          <DialogDescription>
            Buat wilayah posko dusun KKN baru untuk penempatan kelompok mahasiswa dan Koordinator Subunit (Kormasit).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="subunit-name">Nama Subunit Posko</Label>
            <Input
              id="subunit-name"
              placeholder="contoh: Subunit 1 - Dusun Karangrejo"
              {...register('name')}
            />
            <p className="text-[11px] text-muted-foreground">
              Nama posko atau nomor subunit penempatan.
            </p>
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subunit-location">Lokasi Fisik / Alamat Posko</Label>
            <Input
              id="subunit-location"
              placeholder="contoh: Balai Dusun RT 03 / RW 01"
              {...register('location')}
            />
            <p className="text-[11px] text-muted-foreground">
              Alamat posko tempat tinggal atau pusat kegiatan mahasiswa.
            </p>
            {errors.location && (
              <p className="text-xs text-destructive font-medium">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subunit-description">Deskripsi / Fokus Wilayah</Label>
            <Textarea
              id="subunit-description"
              placeholder="contoh: Fokus program kerja pemberdayaan UMKM lokal dan sanitasi air bersih."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Simpan Subunit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

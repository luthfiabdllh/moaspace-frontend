'use client';

import React, { useEffect } from 'react';
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
import { Loader2, Edit3 } from 'lucide-react';
import { updateSubunitSchema, type UpdateSubunitDTO, type SubunitItem } from '../types';
import { useUpdateSubunit } from '../api/use-mutations';

interface EditSubunitDialogProps {
  subunit: SubunitItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubunitDialog({
  subunit,
  open,
  onOpenChange,
}: EditSubunitDialogProps) {
  const { mutate: updateSubunit, isPending } = useUpdateSubunit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSubunitDTO>({
    resolver: zodResolver(updateSubunitSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
    },
  });

  useEffect(() => {
    if (subunit) {
      reset({
        name: subunit.name,
        location: subunit.location ?? '',
        description: subunit.description ?? '',
      });
    }
  }, [subunit, reset]);

  const onSubmit = (values: UpdateSubunitDTO) => {
    if (!subunit) return;
    updateSubunit(
      { id: subunit.id, payload: values },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Edit3 className="size-4" />
            <span>Perbarui Subunit Posko</span>
          </div>
          <DialogTitle className="text-xl">Ubah Informasi Subunit</DialogTitle>
          <DialogDescription>
            Ubah nama posko, alamat fisik posko, atau deskripsi fokus wilayah.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-subunit-name">Nama Subunit Posko</Label>
            <Input
              id="edit-subunit-name"
              placeholder="Nama subunit..."
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-subunit-location">Lokasi Fisik / Alamat Posko</Label>
            <Input
              id="edit-subunit-location"
              placeholder="Alamat posko..."
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
            <Label htmlFor="edit-subunit-description">Deskripsi / Fokus Wilayah</Label>
            <Textarea
              id="edit-subunit-description"
              placeholder="Deskripsi fokus program..."
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
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

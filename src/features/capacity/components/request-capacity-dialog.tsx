'use client';

import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  createCapacityRequestSchema,
  type CreateCapacityRequestDTO,
  type MemberUtilization,
} from '../types';
import { useRequestCapacity } from '../api/use-mutations';

export interface RequestCapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myCapacity?: MemberUtilization;
}

export const RequestCapacityDialog: React.FC<RequestCapacityDialogProps> = ({
  open,
  onOpenChange,
  myCapacity,
}) => {
  const requestMutation = useRequestCapacity();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCapacityRequestDTO>({
    resolver: zodResolver(createCapacityRequestSchema),
    defaultValues: {
      requestedSp: myCapacity?.capacitySp ?? 10,
      note: '',
    },
  });

  React.useEffect(() => {
    if (open && myCapacity) {
      reset({
        requestedSp: myCapacity.capacitySp,
        note: '',
      });
    }
  }, [open, myCapacity, reset]);

  const onSubmit = async (values: CreateCapacityRequestDTO) => {
    try {
      await requestMutation.mutateAsync(values);
      onOpenChange(false);
      reset();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajukan Penyesuaian Kapasitas</DialogTitle>
            <DialogDescription>
              Ajukan perubahan batas Story Point mingguan Anda kepada Koordinator divisi atau Administrator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/60 p-3 text-xs flex justify-between items-center">
              <span className="text-muted-foreground">Kapasitas saat ini:</span>
              <span className="font-semibold text-sm">{myCapacity?.capacitySp ?? 10} SP / minggu</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requestedSp">Kapasitas yang Diajukan (SP) *</Label>
              <Input
                id="requestedSp"
                type="number"
                min={1}
                max={40}
                placeholder="Contoh: 6 atau 15"
                {...register('requestedSp', { valueAsNumber: true })}
              />
              {errors.requestedSp && (
                <p className="text-xs text-destructive">{errors.requestedSp.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Alasan Penyesuaian *</Label>
              <Textarea
                id="note"
                rows={3}
                placeholder="Contoh: Ada jadwal praktikum intensif minggu ini atau kegiatan KKN lapangan..."
                {...register('note')}
              />
              {errors.note && (
                <p className="text-xs text-destructive">{errors.note.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={requestMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={requestMutation.isPending}>
              {requestMutation.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

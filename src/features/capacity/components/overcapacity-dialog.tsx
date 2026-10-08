'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, UserCheck, UserX } from 'lucide-react';
import type { OvercapacityWarningData } from '../types';

export interface OvercapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: OvercapacityWarningData | null;
  onConfirmOverride: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const OvercapacityDialog: React.FC<OvercapacityDialogProps> = ({
  open,
  onOpenChange,
  data,
  onConfirmOverride,
  onCancel,
  isLoading = false,
}) => {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold">
            Peringatan Kapasitas Berlebih (Overcapacity)
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Penugasan ini akan membuat beban kerja anggota melampaui batas kapasitas mingguan (100%).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Anggota:</span>
            <span className="font-semibold text-foreground">{data.assigneeName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Kapasitas Mingguan:</span>
            <span className="font-medium">{data.capacitySp} SP</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Beban Saat Ini:</span>
            <span className="font-medium">{data.currentActiveSp} SP</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tambahan Task Ini:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">+{data.taskSp} SP</span>
          </div>

          <div className="border-t border-amber-200 dark:border-amber-800/60 pt-2 flex items-center justify-between font-semibold">
            <span>Proyeksi Utilisasi:</span>
            <span className="text-rose-600 dark:text-rose-400 text-base">
              {data.projectedSp} SP ({data.utilizationPercentage}%)
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Catatan: Jika Anda memilih <strong>Tetap Assign</strong>, riwayat override penugasan ini akan otomatis dicatat ke dalam log audit sistem untuk pertanggungjawaban beban kerja.
        </p>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="gap-1.5"
          >
            <UserX className="h-4 w-4" />
            Ganti Anggota
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirmOverride}
            disabled={isLoading}
            className="gap-1.5"
          >
            <UserCheck className="h-4 w-4" />
            {isLoading ? 'Menugaskan...' : 'Tetap Assign (Override)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

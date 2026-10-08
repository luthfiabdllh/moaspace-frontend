'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  /**
   * Mode info/validasi: hanya tampilkan satu tombol (tanpa opsi Batal).
   * Dipakai untuk mengganti window.alert() yang sebelumnya cuma punya 1 tombol OK.
   */
  hideCancel?: boolean;
}

/**
 * Pengganti window.confirm() / window.alert() dengan dialog kustom aplikasi,
 * supaya konsisten dengan desain dan tidak memblokir thread browser.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  variant = 'default',
  hideCancel = false,
}: ConfirmDialogProps) {
  const resolvedConfirmLabel =
    confirmLabel || (hideCancel ? 'Mengerti' : variant === 'destructive' ? 'Hapus' : 'Lanjutkan');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!hideCancel && <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>}
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(variant === 'destructive' && buttonVariants({ variant: 'destructive' }))}
          >
            {resolvedConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

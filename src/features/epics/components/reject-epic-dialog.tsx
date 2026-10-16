'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRejectEpic } from '../api/use-mutations';

interface RejectEpicDialogProps {
  epicId: string;
  epicTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectEpicDialog({
  epicId,
  epicTitle,
  open,
  onOpenChange,
}: RejectEpicDialogProps) {
  const [reason, setReason] = useState('');
  const rejectMutation = useRejectEpic();

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 3) return;
    await rejectMutation.mutateAsync({
      id: epicId,
      reason: reason.trim(),
    });
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            <DialogTitle className="text-base font-semibold">
              Minta Revisi Inisiatif / Epic
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Berikan catatan revisi atau alasan pengembalian inisiatif{' '}
            <strong className="text-foreground">&lsquo;{epicTitle}&rsquo;</strong> kepada
            koordinator divisi agar dapat diperbaiki.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label
            htmlFor="rejection-reason"
            className="text-xs font-semibold text-foreground"
          >
            Catatan Revisi / Alasan <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="rejection-reason"
            placeholder="Contoh: Lampiran dokumentasi LPJ belum diunggah, atau task pengujian masih perlu dilengkapi..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="text-xs resize-none"
          />
          <p className="text-3xs text-muted-foreground">
            Catatan ini akan langsung tampil di halaman detail Epic untuk diperbaiki oleh tim divisi.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={rejectMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleReject}
            disabled={
              rejectMutation.isPending || reason.trim().length < 3
            }
            className="gap-1.5"
          >
            {rejectMutation.isPending ? 'Mengirim...' : 'Kirim Catatan Revisi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

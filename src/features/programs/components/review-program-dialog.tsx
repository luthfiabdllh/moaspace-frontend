'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import {
  useReviewProgramCluster,
  useReviewProgramGovernance,
} from '../api/use-mutations';
import type { ProgramItem } from '../types';
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
import { Label } from '@/components/ui/label';

interface ReviewProgramDialogProps {
  program: ProgramItem | null;
  reviewType: 'CLUSTER' | 'GOVERNANCE' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewProgramDialog({
  program,
  reviewType,
  open,
  onOpenChange,
}: ReviewProgramDialogProps) {
  const clusterMutation = useReviewProgramCluster();
  const governanceMutation = useReviewProgramGovernance();

  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reason, setReason] = useState('');

  if (!program || !reviewType) return null;

  const isCluster = reviewType === 'CLUSTER';
  const isPending = clusterMutation.isPending || governanceMutation.isPending;

  const handleSubmit = async () => {
    try {
      if (isCluster) {
        await clusterMutation.mutateAsync({
          id: program.id,
          payload: { decision, reason: decision === 'REJECTED' ? reason : undefined },
        });
      } else {
        await governanceMutation.mutateAsync({
          id: program.id,
          payload: { decision, reason: decision === 'REJECTED' ? reason : undefined },
        });
      }
      setReason('');
      onOpenChange(false);
    } catch {
      // error handled in mutation
    }
  };

  const titleText = isCluster
    ? 'Review Aspek Keilmuan (Kormater)'
    : program.scope === 'UNIT'
      ? 'Review Tata Kelola Unit (Kormanit)'
      : 'Review Tata Kelola Posko (Kormasit)';

  const descText = isCluster
    ? `Verifikasi kesesuaian program kerja dengan rumpun keilmuan klaster ${program.cluster}.`
    : `Verifikasi kesiapan wilayah dan tim pelaksana untuk posko ${program.subunit?.name || 'Unit'}.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            {isCluster ? <Sparkles className="size-4" /> : <ShieldCheck className="size-4" />}
            <span>Approval Paralel Program Kerja</span>
          </div>
          <DialogTitle className="text-lg font-bold">{titleText}</DialogTitle>
          <DialogDescription>{descText}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info Proker */}
          <div className="p-3 rounded-lg bg-muted/60 border text-xs space-y-1">
            <p className="font-semibold text-foreground text-sm line-clamp-1">{program.title}</p>
            <p className="text-muted-foreground">
              PIC: <span className="text-foreground font-medium">{program.primaryPic?.name}</span> • Rumpun: <span className="text-foreground font-medium">{program.cluster}</span>
            </p>
          </div>

          {/* Opsi Keputusan */}
          <div className="space-y-2">
            <Label>Keputusan Review</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={decision === 'APPROVED' ? 'default' : 'outline'}
                className={`justify-center gap-2 ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'border-muted-foreground/30 hover:border-emerald-500'
                }`}
                onClick={() => setDecision('APPROVED')}
              >
                <CheckCircle2 className="size-4" />
                Setujui (Approve)
              </Button>
              <Button
                type="button"
                variant={decision === 'REJECTED' ? 'destructive' : 'outline'}
                className="justify-center gap-2"
                onClick={() => setDecision('REJECTED')}
              >
                <XCircle className="size-4" />
                Tolak / Revisi
              </Button>
            </div>
          </div>

          {/* Catatan / Alasan jika ditolak */}
          {decision === 'REJECTED' && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
              <Label htmlFor="review-reason" className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="size-3.5" />
                Catatan Penolakan / Permintaan Revisi
              </Label>
              <Textarea
                id="review-reason"
                rows={3}
                placeholder="Tuliskan masukan spesifik yang perlu diperbaiki oleh PIC Utama..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className={`gap-2 ${
              decision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Kirim Keputusan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

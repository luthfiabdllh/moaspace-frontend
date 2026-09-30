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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import type { MemberUtilization } from '../types';
import { useReviewCapacity } from '../api/use-mutations';

export interface ReviewCapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberUtilization | null;
}

export const ReviewCapacityDialog: React.FC<ReviewCapacityDialogProps> = ({
  open,
  onOpenChange,
  member,
}) => {
  const reviewMutation = useReviewCapacity();
  const [approvedSp, setApprovedSp] = React.useState<number>(10);
  const [reviewNote, setReviewNote] = React.useState<string>('');

  React.useEffect(() => {
    if (member) {
      setApprovedSp(member.requestedSp ?? member.capacitySp);
      setReviewNote('');
    }
  }, [member]);

  if (!member) return null;

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    try {
      await reviewMutation.mutateAsync({
        capacityId: member.capacityId,
        dto: {
          action,
          approvedSp: action === 'APPROVE' ? approvedSp : undefined,
          note: reviewNote.trim() || undefined,
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tinjau Pengajuan Kapasitas</DialogTitle>
          <DialogDescription>
            Persetujuan atau penolakan pengajuan kapasitas mingguan anggota.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anggota:</span>
              <span className="font-semibold">{member.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kapasitas Saat Ini:</span>
              <span>{member.capacitySp} SP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kapasitas Diajukan:</span>
              <span className="font-semibold text-primary">{member.requestedSp} SP</span>
            </div>
            {member.note && (
              <div className="pt-2 border-t text-xs">
                <span className="text-muted-foreground block mb-0.5">Alasan Pengajuan:</span>
                <p className="italic text-foreground bg-background/80 p-2 rounded border">
                  "{member.note}"
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="approvedSp">Kapasitas yang Disetujui (SP)</Label>
            <Input
              id="approvedSp"
              type="number"
              min={1}
              max={40}
              value={approvedSp}
              onChange={(e) => setApprovedSp(Number(e.target.value))}
            />
            <p className="text-[11px] text-muted-foreground">
              Anda dapat mengubah angka kapasitas jika ingin menyetujui sebagian.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reviewNote">Catatan Peninjau (Opsional)</Label>
            <Textarea
              id="reviewNote"
              rows={2}
              placeholder="Catatan atau masukan untuk anggota..."
              value={reviewNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleAction('REJECT')}
            disabled={reviewMutation.isPending}
            className="gap-1.5"
          >
            <X className="h-4 w-4" />
            Tolak
          </Button>
          <Button
            type="button"
            onClick={() => handleAction('APPROVE')}
            disabled={reviewMutation.isPending}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            {reviewMutation.isPending ? 'Memproses...' : 'Setujui Pengajuan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { RequestStatus } from '../types';
import {
  Clock,
  Send,
  HelpCircle,
  XCircle,
  CheckCircle,
  PlayCircle,
  PackageCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return (
        <Badge variant="outline" className={`gap-1 bg-muted/50 text-muted-foreground ${className}`}>
          Draft
        </Badge>
      );
    case 'WAITING_ORIGIN_APPROVAL':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 ${className}`}
        >
          <Clock className="h-3 w-3" />
          Menunggu Approval Asal
        </Badge>
      );
    case 'SUBMITTED':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 ${className}`}
        >
          <Send className="h-3 w-3" />
          Diajukan
        </Badge>
      );
    case 'NEED_INFO':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 ${className}`}
        >
          <HelpCircle className="h-3 w-3" />
          Butuh Info Tambahan
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30 ${className}`}
        >
          <XCircle className="h-3 w-3" />
          Ditolak
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 ${className}`}
        >
          <CheckCircle className="h-3 w-3" />
          Diterima
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 ${className}`}
        >
          <PlayCircle className="h-3 w-3" />
          Sedang Dikerjakan
        </Badge>
      );
    case 'DELIVERED':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 ${className}`}
        >
          <PackageCheck className="h-3 w-3" />
          Hasil Dikirim
        </Badge>
      );
    case 'REVISION':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 ${className}`}
        >
          <RotateCcw className="h-3 w-3" />
          Revisi
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge
          variant="outline"
          className={`gap-1 bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30 ${className}`}
        >
          <Sparkles className="h-3 w-3" />
          Selesai Disetujui
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Sparkles, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import type {
  ProgramStatus,
  ProgramScope,
  ProgramCluster,
  ProgramApprovalStatus,
} from '../types';

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  switch (status) {
    case 'PROPOSED':
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium gap-1 text-xs"
        >
          <Clock className="size-3 text-amber-500" />
          Usulan (Proposed)
        </Badge>
      );
    case 'ACTIVE':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1 text-xs"
        >
          <CheckCircle2 className="size-3 text-emerald-500" />
          Aktif Berjalan
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 font-medium gap-1 text-xs"
        >
          <CheckCircle2 className="size-3 text-blue-500" />
          Selesai (Completed)
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 font-medium gap-1 text-xs"
        >
          <XCircle className="size-3 text-slate-500" />
          Dibatalkan
        </Badge>
      );
  }
}

export function ProgramScopeBadge({
  scope,
  subunitName,
}: {
  scope: ProgramScope;
  subunitName?: string | null;
}) {
  if (scope === 'UNIT') {
    return (
      <Badge
        variant="secondary"
        className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-medium gap-1 text-xs"
      >
        <Globe className="size-3 text-purple-500" />
        Tingkat Unit
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-medium gap-1 text-xs"
    >
      <MapPin className="size-3 text-sky-500" />
      {subunitName || 'Subunit Posko'}
    </Badge>
  );
}

export function ProgramClusterBadge({ cluster }: { cluster: ProgramCluster }) {
  switch (cluster) {
    case 'SAINTEK':
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-xs"
        >
          <span className="size-1.5 rounded-full bg-sky-500 mr-1" />
          Klaster Saintek
        </Badge>
      );
    case 'SOSHUM':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 mr-1" />
          Klaster Soshum
        </Badge>
      );
    case 'MEDIKA':
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-xs"
        >
          <span className="size-1.5 rounded-full bg-rose-500 mr-1" />
          Klaster Medika
        </Badge>
      );
    case 'AGRO':
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs"
        >
          <span className="size-1.5 rounded-full bg-amber-500 mr-1" />
          Klaster Agro
        </Badge>
      );
    case 'UNIT_SHARED':
      return (
        <Badge
          variant="outline"
          className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 text-xs"
        >
          <Sparkles className="size-3 text-violet-500 mr-1" />
          Lintas Rumpun Ilmu
        </Badge>
      );
  }
}

export function DualApprovalStatusBadge({
  clusterStatus,
  governanceStatus,
  scope,
}: {
  clusterStatus: ProgramApprovalStatus;
  governanceStatus: ProgramApprovalStatus;
  scope: ProgramScope;
}) {
  const renderItem = (
    label: string,
    status: ProgramApprovalStatus,
  ) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <CheckCircle2 className="size-3" />
          {label}: Disetujui
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
          <AlertCircle className="size-3" />
          {label}: Ditolak/Revisi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
        <Clock className="size-3" />
        {label}: Menunggu
      </span>
    );
  };

  const govLabel = scope === 'UNIT' ? 'Kormanit' : 'Kormasit';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {renderItem('Kormater', clusterStatus)}
      {renderItem(govLabel, governanceStatus)}
    </div>
  );
}

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import type { AcademicCluster } from '../types';

interface ClusterBadgeProps {
  cluster?: AcademicCluster | null;
  isCoordinator?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}

export const CLUSTER_CONFIG: Record<
  AcademicCluster,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  SAINTEK: {
    label: 'Saintek',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30',
    dot: 'bg-sky-500',
  },
  SOSHUM: {
    label: 'Soshum',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  MEDIKA: {
    label: 'Medika',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  AGRO: {
    label: 'Agro',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
};

export function ClusterBadge({
  cluster,
  isCoordinator = false,
  className = '',
  size = 'default',
}: ClusterBadgeProps) {
  if (!cluster && !isCoordinator) return null;

  const config = cluster ? CLUSTER_CONFIG[cluster] : null;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {config && (
        <Badge
          variant="outline"
          className={`${config.bg} ${config.text} ${config.border} font-medium ${
            size === 'sm' ? 'text-[11px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
          }`}
        >
          <span className={`size-1.5 rounded-full mr-1 ${config.dot}`} />
          {config.label}
        </Badge>
      )}

      {isCoordinator && (
        <Badge
          variant="secondary"
          className={`bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold gap-1 ${
            size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-[11px] px-2 py-0.5'
          }`}
          title="Koordinator Mahasiswa Klaster"
        >
          <Sparkles className="size-3 text-indigo-500" />
          Kormater
        </Badge>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { AlertCircle, Calendar, Info, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AnnouncementCategory } from '../types';

interface AnnouncementBadgeProps {
  category: AnnouncementCategory;
  className?: string;
}

export function AnnouncementCategoryBadge({ category, className }: AnnouncementBadgeProps) {
  switch (category) {
    case 'URGENT':
      return (
        <Badge
          variant="secondary"
          className={`gap-1 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-medium ${className || ''}`}
        >
          <AlertCircle className="size-3" />
          Penting
        </Badge>
      );
    case 'MEETING':
      return (
        <Badge
          variant="secondary"
          className={`gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-medium ${className || ''}`}
        >
          <Users className="size-3" />
          Rapat
        </Badge>
      );
    case 'ACTIVITY':
      return (
        <Badge
          variant="secondary"
          className={`gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium ${className || ''}`}
        >
          <Calendar className="size-3" />
          Kegiatan
        </Badge>
      );
    case 'INFO':
    default:
      return (
        <Badge
          variant="outline"
          className={`gap-1 text-muted-foreground border-border/80 font-medium ${className || ''}`}
        >
          <Info className="size-3" />
          Informasi
        </Badge>
      );
  }
}

interface AnnouncementTargetBadgeProps {
  targetType: 'ALL' | 'DIVISION' | 'SUBUNIT' | 'CLUSTER';
  divisionName?: string | null;
  subunitName?: string | null;
  cluster?: string | null;
  className?: string;
}

export function AnnouncementTargetBadge({
  targetType,
  divisionName,
  subunitName,
  cluster,
  className,
}: AnnouncementTargetBadgeProps) {
  switch (targetType) {
    case 'DIVISION':
      return (
        <Badge
          variant="outline"
          className={`text-xs gap-1 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/5 ${className || ''}`}
        >
          <Users className="size-3" />
          Divisi {divisionName || 'Spesifik'}
        </Badge>
      );
    case 'SUBUNIT':
      return (
        <Badge
          variant="outline"
          className={`text-xs gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/5 ${className || ''}`}
        >
          <Users className="size-3" />
          Posko {subunitName || 'Spesifik'}
        </Badge>
      );
    case 'CLUSTER':
      return (
        <Badge
          variant="outline"
          className={`text-xs gap-1 border-violet-500/30 text-violet-700 dark:text-violet-400 bg-violet-500/5 ${className || ''}`}
        >
          <Users className="size-3" />
          Klaster {cluster || 'Spesifik'}
        </Badge>
      );
    case 'ALL':
    default:
      return (
        <Badge variant="outline" className={`text-xs text-muted-foreground gap-1 ${className || ''}`}>
          <Users className="size-3" />
          Semua Tim
        </Badge>
      );
  }
}

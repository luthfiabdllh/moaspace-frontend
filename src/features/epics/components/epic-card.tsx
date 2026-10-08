'use client';

import Link from 'next/link';
import {
  Calendar,
  Layers,
  Network,
  CheckCircle2,
  Clock,
  GitPullRequest,
} from 'lucide-react';
import type { EpicItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface EpicCardProps {
  epic: EpicItem;
  onSelect?: (epic: EpicItem) => void;
}

export function EpicCard({ epic, onSelect }: EpicCardProps) {
  const isCross = epic.scope === 'CROSS';

  const dateRange =
    epic.startDate || epic.endDate
      ? `${epic.startDate ? new Date(epic.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : ''} - ${
          epic.endDate ? new Date(epic.endDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Seterusnya'
        }`
      : null;

  return (
    <Link href={`/epics/${epic.id}`} className="block focus:outline-none">
      <Card
        onClick={() => onSelect?.(epic)}
        className="group rounded-2xl shadow-2xs border-border/80 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer bg-card hover:bg-muted/15 h-full"
      >
        <CardContent className="p-5 space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isCross ? (
              <Badge className="bg-indigo-600/90 text-white hover:bg-indigo-600 gap-1 text-2xs">
                <Network className="size-3" />
                Lintas Divisi
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-2xs text-muted-foreground">
                <Layers className="size-3 text-primary" />
                {epic.ownerDivisionName || 'Divisi'}
              </Badge>
            )}

            {epic.prokerTag && (
              <Badge variant="secondary" className="font-mono text-2xs">
                #{epic.prokerTag}
              </Badge>
            )}

            {epic.sourceRequestId && (
              <span
                className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                title={`Berasal dari Permohonan: ${epic.requestTitle || epic.sourceRequestId}`}
              >
                <GitPullRequest className="size-3 text-amber-600 dark:text-amber-400" />
                <span>Req: Kolaborasi</span>
              </span>
            )}
          </div>

          <div>
            {epic.isClosed ? (
              <Badge variant="secondary" className="gap-1 text-2xs text-muted-foreground">
                <CheckCircle2 className="size-3 text-emerald-500" />
                Ditutup
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20 text-2xs gap-1">
                <Clock className="size-3" />
                Aktif
              </Badge>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {epic.title}
          </h3>
          {epic.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {epic.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
            </p>
          )}
        </div>

        {/* Participating Divisions if Cross */}
        {isCross && epic.participatingDivisions.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center pt-1">
            <span className="text-2xs text-muted-foreground">Divisi:</span>
            {epic.participatingDivisions.map((p) => (
              <span
                key={p.id}
                className="text-2xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Progres Inisiatif</span>
            <span className="font-semibold text-foreground">
              {epic.progressPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                epic.progressPercentage === 100
                  ? 'bg-emerald-500'
                  : epic.progressPercentage > 50
                    ? 'bg-primary'
                    : 'bg-indigo-500'
              }`}
              style={{ width: `${epic.progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-2xs text-muted-foreground pt-1">
            <span>
              {epic.doneTasks} dari {epic.totalTasks} task selesai
            </span>
            <span>{epic.storyCount} stories</span>
          </div>
        </div>

        {/* Dates Footer */}
        {dateRange && (
          <div className="flex items-center gap-1.5 text-2xs text-muted-foreground pt-1 border-t border-border/40">
            <Calendar className="size-3" />
            <span>{dateRange}</span>
          </div>
        )}
      </CardContent>
    </Card>
  </Link>
);
}

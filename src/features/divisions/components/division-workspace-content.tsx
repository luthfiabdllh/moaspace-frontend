'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Columns,
  Sparkles,
  Bookmark,
  Layers,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { DivisionBoardContent } from '@/features/kanban/components/division-board-content';
import { HierarchyBreakdownView } from '@/features/epics/components/hierarchy-breakdown-view';
import { DivisionStoriesContent } from '@/features/stories/components/division-stories-content';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DivisionWorkspaceContentProps {
  divisionSlug: string;
  initialTab?: 'KANBAN' | 'HIERARCHY' | 'STORIES';
}

export function DivisionWorkspaceContent({
  divisionSlug,
  initialTab = 'KANBAN',
}: DivisionWorkspaceContentProps) {
  const { data: user } = useCurrentUser();
  const { data: divisions = [], isLoading } = useDivisions();

  const division = useMemo(() => {
    return divisions.find((d) => d.slug === divisionSlug);
  }, [divisions, divisionSlug]);

  const [activeTab, setActiveTab] = useState<'KANBAN' | 'HIERARCHY' | 'STORIES'>(initialTab);

  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = Boolean(
    isGlobalAdmin ||
      user?.divisions.some(
        (d) => d.divisionId === division?.id && d.role === 'COORDINATOR'
      )
  );

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 bg-muted rounded-lg" />
        <div className="h-96 w-full bg-muted rounded-xl" />
      </div>
    );
  }

  if (!division) {
    return (
      <div className="p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
        <Layers className="size-8 text-destructive mx-auto" />
        <h3 className="font-semibold text-lg text-foreground">Divisi Tidak Ditemukan</h3>
        <p className="text-xs text-muted-foreground">
          Divisi dengan slug &quot;{divisionSlug}&quot; tidak terdaftar di sistem.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline pt-2"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <FolderKanban className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {division.name}
              </h1>
              {isCoordinator && (
                <Badge variant="outline" className="text-2xs text-amber-600 border-amber-300 gap-1 font-normal">
                  <Award className="size-3 text-amber-500" />
                  Koordinator
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ruang Kerja Divisi: Papan Kanban, Pemecahan Tugas, & Deliverables
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('KANBAN')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
              activeTab === 'KANBAN'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Columns className="size-3.5 text-primary" />
            Papan Kanban
          </button>

          <button
            onClick={() => setActiveTab('HIERARCHY')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
              activeTab === 'HIERARCHY'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="size-3.5 text-indigo-500" />
            Pohon Hierarki (Epic &rarr; Story &rarr; Task)
          </button>

          <button
            onClick={() => setActiveTab('STORIES')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
              activeTab === 'STORIES'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Bookmark className="size-3.5 text-emerald-500" />
            Deliverables & DoD
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'KANBAN' && (
        <DivisionBoardContent divisionSlug={divisionSlug} hideHeader={true} />
      )}

      {activeTab === 'HIERARCHY' && (
        <HierarchyBreakdownView
          divisionId={division.id}
          divisionSlug={divisionSlug}
        />
      )}

      {activeTab === 'STORIES' && (
        <DivisionStoriesContent divisionSlug={divisionSlug} hideHeader={true} />
      )}
    </div>
  );
}

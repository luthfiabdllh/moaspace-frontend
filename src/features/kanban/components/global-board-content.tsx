'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FolderKanban,
  Columns,
  Sparkles,
  Bookmark,
  Layers,
  Award,
} from 'lucide-react';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { DivisionBoardContent } from './division-board-content';
import { HierarchyBreakdownView } from '@/features/epics/components/hierarchy-breakdown-view';
import { DivisionStoriesContent } from '@/features/stories/components/division-stories-content';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function GlobalBoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDivSlug = searchParams.get('division');

  const { data: user } = useCurrentUser();
  const { data: divisions = [], isLoading: isDivisionsLoading } = useDivisions();

  const userDivisions = user?.divisions ?? [];
  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);

  // Available divisions for user: all divisions if admin, otherwise user's divisions (or all if none assigned yet)
  const availableDivisions = useMemo(() => {
    if (isGlobalAdmin) return divisions;
    if (userDivisions.length > 0) {
      return divisions.filter((d) =>
        userDivisions.some((ud) => ud.divisionId === d.id)
      );
    }
    return divisions;
  }, [divisions, userDivisions, isGlobalAdmin]);

  // Selected Division Slug
  const [selectedSlug, setSelectedSlug] = useState<string>('');

  useEffect(() => {
    if (queryDivSlug && divisions.some((d) => d.slug === queryDivSlug)) {
      setSelectedSlug(queryDivSlug);
    } else if (!selectedSlug && availableDivisions.length > 0) {
      setSelectedSlug(availableDivisions[0].slug);
    }
  }, [queryDivSlug, divisions, availableDivisions, selectedSlug]);

  const activeDivision = useMemo(() => {
    return divisions.find((d) => d.slug === selectedSlug);
  }, [divisions, selectedSlug]);

  const [activeTab, setActiveTab] = useState<'KANBAN' | 'HIERARCHY' | 'STORIES'>('KANBAN');

  const handleSelectDivision = (slug: string) => {
    setSelectedSlug(slug);
    router.replace(`/board?division=${slug}`);
  };

  if (isDivisionsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 bg-muted rounded-lg" />
        <div className="h-96 w-full bg-muted rounded-xl" />
      </div>
    );
  }

  if (divisions.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed text-muted-foreground space-y-3">
        <Layers className="size-8 mx-auto text-muted-foreground/60" />
        <h3 className="font-semibold text-base text-foreground">Belum Ada Divisi Terdaftar</h3>
        <p className="text-xs text-muted-foreground">
          Hubungi Super Admin untuk membuat divisi kerja KKN terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Division Selector Pill Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pilih Divisi Kerja KKN:
          </span>
          {activeDivision && (
            <span className="text-2xs text-muted-foreground">
              Slug: <code className="font-mono text-primary">{activeDivision.slug}</code>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {availableDivisions.map((div) => {
            const isSelected = div.slug === selectedSlug;
            const isUserCoord = userDivisions.some(
              (ud) => ud.divisionId === div.id && ud.role === 'COORDINATOR'
            );

            return (
              <button
                key={div.id}
                onClick={() => handleSelectDivision(div.slug)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border shadow-2xs',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground'
                )}
              >
                <FolderKanban className="size-3.5 shrink-0" />
                <span>{div.name}</span>
                {isUserCoord && (
                  <span title="Koordinator Divisi">
                    <Award className="size-3 text-amber-400 shrink-0" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs Navigation: Papan Kanban vs Pohon Hierarki vs Deliverables */}
      <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1 text-xs font-medium">
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
            Papan Kanban (5 Kolom)
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
            Daftar Deliverables
          </button>
        </div>
      </div>

      {/* Content depending on Active Tab */}
      {selectedSlug && (
        <div>
          {activeTab === 'KANBAN' && (
            <DivisionBoardContent divisionSlug={selectedSlug} />
          )}

          {activeTab === 'HIERARCHY' && activeDivision && (
            <HierarchyBreakdownView
              divisionId={activeDivision.id}
              divisionSlug={selectedSlug}
            />
          )}

          {activeTab === 'STORIES' && (
            <DivisionStoriesContent divisionSlug={selectedSlug} />
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FolderKanban,
  Columns,
  Sparkles,
  Bookmark,
  Layers,
  Award,
  Users,
} from 'lucide-react';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { DivisionBoardContent } from './division-board-content';
import { HierarchyBreakdownView } from '@/features/epics/components/hierarchy-breakdown-view';
import { DivisionStoriesContent } from '@/features/stories/components/division-stories-content';
import { DivisionCapacityContent } from '@/features/capacity/components/division-capacity-content';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type BoardTab = 'KANBAN' | 'HIERARCHY' | 'STORIES' | 'CAPACITY';

export function GlobalBoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDivSlug = searchParams.get('division');
  const queryTab = searchParams.get('tab')?.toUpperCase();

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

  // Adjusted during render (not in an effect) whenever the URL division param
  // or the loaded division list changes — see react-hooks/set-state-in-effect.
  const [prevSyncKey, setPrevSyncKey] = useState({
    queryDivSlug,
    divisions,
    availableDivisions,
    selectedSlug,
  });
  if (
    queryDivSlug !== prevSyncKey.queryDivSlug ||
    divisions !== prevSyncKey.divisions ||
    availableDivisions !== prevSyncKey.availableDivisions ||
    selectedSlug !== prevSyncKey.selectedSlug
  ) {
    setPrevSyncKey({ queryDivSlug, divisions, availableDivisions, selectedSlug });
    if (queryDivSlug && divisions.some((d) => d.slug === queryDivSlug)) {
      setSelectedSlug(queryDivSlug);
    } else if (!selectedSlug && availableDivisions.length > 0) {
      setSelectedSlug(availableDivisions[0].slug);
    }
  }

  const activeDivision = useMemo(() => {
    return divisions.find((d) => d.slug === selectedSlug);
  }, [divisions, selectedSlug]);

  const isUserCoord = Boolean(
    isGlobalAdmin ||
      (activeDivision &&
        userDivisions.some(
          (ud) => ud.divisionId === activeDivision.id && ud.role === 'COORDINATOR'
        ))
  );

  // Active Tab state synced with URL ?tab=
  const initialTab: BoardTab = useMemo(() => {
    if (queryTab === 'HIERARCHY') return 'HIERARCHY';
    if (queryTab === 'STORIES') return 'STORIES';
    if (queryTab === 'CAPACITY') return 'CAPACITY';
    return 'KANBAN';
  }, [queryTab]);

  const [activeTab, setActiveTab] = useState<BoardTab>(initialTab);

  // Adjusted during render (not in an effect) when the URL tab param changes
  // — see react-hooks/set-state-in-effect.
  const [prevQueryTab, setPrevQueryTab] = useState(queryTab);
  if (queryTab !== prevQueryTab) {
    setPrevQueryTab(queryTab);
    if (queryTab && ['KANBAN', 'HIERARCHY', 'STORIES', 'CAPACITY'].includes(queryTab)) {
      setActiveTab(queryTab as BoardTab);
    }
  }

  const handleSelectTab = (tab: BoardTab) => {
    setActiveTab(tab);
    const tabParam = tab.toLowerCase();
    router.replace(`/board?division=${selectedSlug}&tab=${tabParam}`);
  };

  const handleSelectDivision = (slug: string) => {
    setSelectedSlug(slug);
    const tabParam = activeTab.toLowerCase();
    router.replace(`/board?division=${slug}&tab=${tabParam}`);
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
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <FolderKanban className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {activeDivision ? activeDivision.name : 'Papan Kerja Divisi'}
                  {activeDivision && isUserCoord && (
                    <Badge variant="outline" className="text-2xs text-amber-600 border-amber-300 gap-1 font-normal">
                      <Award className="size-3 text-amber-500" />
                      Koordinator
                    </Badge>
                  )}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ruang kerja terintegrasi divisi: kelola papan Kanban, hierarki tugas, deliverable, dan kapasitas beban kerja.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Deck: Division Pills + View Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-2.5 rounded-xl border border-border/80 bg-card shadow-2xs">
        {/* Division Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground px-1 shrink-0">
            Divisi:
          </span>
          {availableDivisions.map((div) => {
            const isSelected = div.slug === selectedSlug;
            const isDivCoord = userDivisions.some(
              (ud) => ud.divisionId === div.id && ud.role === 'COORDINATOR'
            );

            return (
              <button
                key={div.id}
                onClick={() => handleSelectDivision(div.slug)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border select-none',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                    : 'bg-background text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{div.name}</span>
                {isDivCoord && (
                  <Award
                    className={cn(
                      'size-3 shrink-0',
                      isSelected ? 'text-primary-foreground' : 'text-amber-500'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* View Switcher Tabs (4 Tabs) */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 text-xs font-medium shrink-0 self-start xl:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleSelectTab('KANBAN')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all select-none',
              activeTab === 'KANBAN'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Columns className="size-3.5 text-primary" />
            <span>Papan Kanban</span>
          </button>

          <button
            onClick={() => handleSelectTab('HIERARCHY')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all select-none',
              activeTab === 'HIERARCHY'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="size-3.5 text-indigo-500" />
            <span>Pohon Hierarki</span>
          </button>

          <button
            onClick={() => handleSelectTab('STORIES')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all select-none',
              activeTab === 'STORIES'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Bookmark className="size-3.5 text-emerald-500" />
            <span>Deliverables</span>
          </button>

          <button
            onClick={() => handleSelectTab('CAPACITY')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all select-none',
              activeTab === 'CAPACITY'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="size-3.5 text-blue-500" />
            <span>Kapasitas Tim</span>
          </button>
        </div>
      </div>

      {/* Content depending on Active Tab */}
      {selectedSlug && (
        <div className="min-w-0">
          {activeTab === 'KANBAN' && (
            <DivisionBoardContent divisionSlug={selectedSlug} hideHeader={true} />
          )}

          {activeTab === 'HIERARCHY' && activeDivision && (
            <HierarchyBreakdownView
              divisionId={activeDivision.id}
              divisionSlug={selectedSlug}
            />
          )}

          {activeTab === 'STORIES' && (
            <DivisionStoriesContent divisionSlug={selectedSlug} hideHeader={true} />
          )}

          {activeTab === 'CAPACITY' && (
            <DivisionCapacityContent slug={selectedSlug} hideHeader={true} />
          )}
        </div>
      )}
    </div>
  );
}

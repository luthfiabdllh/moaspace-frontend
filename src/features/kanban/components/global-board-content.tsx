'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FolderKanban,
  Columns,
  Sparkles,
  Bookmark,
  Layers,
  Award,
  ExternalLink,
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

  const isUserCoord = Boolean(
    isGlobalAdmin ||
      (activeDivision &&
        userDivisions.some(
          (ud) => ud.divisionId === activeDivision.id && ud.role === 'COORDINATOR'
        ))
  );

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
                  {activeDivision ? activeDivision.name : 'Papan Kanban Divisi'}
                  {activeDivision && isUserCoord && (
                    <Badge variant="outline" className="text-2xs text-amber-600 border-amber-300 gap-1 font-normal">
                      <Award className="size-3 text-amber-500" />
                      Koordinator
                    </Badge>
                  )}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Papan kerja terintegrasi: pantau unit task, alur kerja sprint, dan deliverable divisi KKN.
              </p>
            </div>
          </div>
        </div>

        {/* Action Link to Full Division Workspace */}
        {activeDivision && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/d/${activeDivision.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border bg-card hover:bg-muted transition-colors shadow-2xs"
            >
              <span>Ruang Kerja Divisi</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* Control Deck: Division Pills + View Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 rounded-xl border border-border/80 bg-card shadow-2xs">
        {/* Division Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
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

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 text-xs font-medium shrink-0 self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('KANBAN')}
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
            onClick={() => setActiveTab('HIERARCHY')}
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
            onClick={() => setActiveTab('STORIES')}
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
        </div>
      )}
    </div>
  );
}

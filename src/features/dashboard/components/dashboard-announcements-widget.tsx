'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronRight,
  Megaphone,
  Pin,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnnouncements } from '@/features/announcements/api/use-queries';
import { AnnouncementCategoryBadge } from '@/features/announcements/components/announcement-badge';
import { AnnouncementDetailDialog } from '@/features/announcements/components/announcement-detail-dialog';
import type { Announcement } from '@/features/announcements/types';

export function DashboardAnnouncementsWidget() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const displayedAnnouncements = announcements.slice(0, 3);

  const handleOpenDetail = (item: Announcement) => {
    setSelectedAnnouncement(item);
    setDetailOpen(true);
  };

  return (
    <>
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 px-5 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Megaphone className="size-4" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-tight">
              Pengumuman &amp; Agenda Tim
            </CardTitle>
          </div>

          <Button variant="ghost" size="xs" asChild className="text-xs text-primary gap-1 h-7">
            <Link href="/announcements">
              <span>Lihat Semua</span>
              <ChevronRight className="size-3" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-3 divide-y divide-border/40">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Memuat pengumuman...
            </div>
          ) : displayedAnnouncements.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Belum ada pengumuman terbaru untuk Anda.
            </div>
          ) : (
            displayedAnnouncements.map((item) => {
              const startDate = item.eventStartDate ? new Date(item.eventStartDate) : null;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <AnnouncementCategoryBadge category={item.category} className="text-[10px] py-0 px-1.5" />
                      {item.isPinned && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 gap-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        >
                          <Pin className="size-2.5" />
                          Pin
                        </Badge>
                      )}
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                    {item.title}
                  </h4>

                  {startDate && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1 font-medium text-foreground/80">
                        <Calendar className="size-3 text-primary" />
                        <span>
                          {startDate.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <span className="text-muted-foreground/30">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>
                          {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <AnnouncementDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcement={selectedAnnouncement}
      />
    </>
  );
}

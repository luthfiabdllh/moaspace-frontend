'use client';

import * as React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Pin,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AnnouncementCategoryBadge } from './announcement-badge';
import { NotionEditor } from '@/components/ui/notion-editor';
import type { Announcement } from '../types';

interface AnnouncementDetailDialogProps {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementDetailDialog({
  announcement,
  open,
  onOpenChange,
}: AnnouncementDetailDialogProps) {
  if (!announcement) return null;

  // Extract html or raw text from content
  const htmlContent =
    typeof announcement.content === 'object' && announcement.content !== null
      ? (announcement.content.html as string) || ''
      : '';

  const startDate = announcement.eventStartDate ? new Date(announcement.eventStartDate) : null;
  const endDate = announcement.eventEndDate ? new Date(announcement.eventEndDate) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <AnnouncementCategoryBadge category={announcement.category} />

            {announcement.isPinned && (
              <Badge
                variant="secondary"
                className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-medium"
              >
                <Pin className="size-3 fill-amber-500/20" />
                Disematkan
              </Badge>
            )}

            <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
              <Users className="size-3" />
              {announcement.targetType === 'ALL'
                ? 'Semua Tim KKN'
                : `Divisi ${announcement.targetDivision?.name || 'Spesifik'}`}
            </Badge>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-snug">
            {announcement.title}
          </DialogTitle>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <span>Diterbitkan oleh <strong className="text-foreground">{announcement.author.name}</strong></span>
            <span>•</span>
            <span>
              {new Date(announcement.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </DialogHeader>

        {/* Schedule / Agenda Banner if present */}
        {startDate && (
          <div className="bg-muted/30 border-b border-border/60 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Calendar className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {startDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mt-0.5">
                  <Clock className="size-3" />
                  <span>
                    {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    {endDate &&
                      ` - ${endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`}
                  </span>
                </div>
              </div>
            </div>

            {announcement.location && (
              <div className="flex items-center gap-1.5 text-muted-foreground bg-background/80 px-2.5 py-1.5 rounded-md border border-border/60 self-start sm:self-center">
                <MapPin className="size-3.5 text-destructive shrink-0" />
                <span className="font-medium text-foreground">{announcement.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          <NotionEditor
            value={htmlContent}
            readOnly={true}
            className="border-none bg-transparent p-0 shadow-none min-h-37.5"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import * as React from 'react';
import {
  Calendar,
  Clock,
  MoreVertical,
  Pin,
  Pencil,
  Trash2,
  Users,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnnouncementCategoryBadge } from './announcement-badge';
import type { Announcement } from '../types';

interface AnnouncementCardProps {
  announcement: Announcement;
  canManage: boolean;
  onView: (announcement: Announcement) => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}

export function AnnouncementCard({
  announcement,
  canManage,
  onView,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const startDate = announcement.eventStartDate ? new Date(announcement.eventStartDate) : null;
  const endDate = announcement.eventEndDate ? new Date(announcement.eventEndDate) : null;

  // Extract snippet from html
  const rawHtml =
    typeof announcement.content === 'object' && announcement.content !== null
      ? (announcement.content.html as string) || ''
      : '';
  const plainText = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return (
    <Card
      onClick={() => onView(announcement)}
      className={`group relative border transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer overflow-hidden ${
        announcement.isPinned
          ? 'bg-amber-500/2 border-amber-500/30 dark:border-amber-500/20'
          : 'bg-card border-border/70'
      }`}
    >
      {announcement.isPinned && (
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
          <div className="absolute transform rotate-45 bg-amber-500 text-white text-[9px] font-bold py-0.5 -right-8.75 top-3.5 w-30 text-center shadow-xs">
            PIN
          </div>
        </div>
      )}

      <CardContent className="p-5 space-y-3.5">
        {/* Header Tags & Actions */}
        <div className="flex items-center justify-between gap-2 pr-6">
          <div className="flex items-center gap-1.5 flex-wrap">
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
                ? 'Semua Tim'
                : announcement.targetDivision?.name || 'Divisi'}
            </Badge>
          </div>

          {canManage && (
            <div
              className="absolute top-4 right-3"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100"
                  >
                    <MoreVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(announcement)}
                      className="gap-2 cursor-pointer"
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                      <span>Edit Pengumuman</span>
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(announcement)}
                      className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Hapus Pengumuman</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {announcement.title}
          </h3>

          {plainText && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
              {plainText}
            </p>
          )}
        </div>

        {/* Event Schedule Pill if present */}
        {startDate && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Calendar className="size-3 text-primary" />
              <span>
                {startDate.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <span className="text-muted-foreground/40">•</span>

            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>
                {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                {endDate &&
                  ` - ${endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>

            {announcement.location && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <div className="flex items-center gap-1 truncate max-w-37.5">
                  <MapPin className="size-3 text-destructive" />
                  <span className="truncate">{announcement.location}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/80">{announcement.author.name}</span>
          <span>
            {new Date(announcement.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

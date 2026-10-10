'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnnouncementCategoryBadge, AnnouncementTargetBadge } from './announcement-badge';
import type { Announcement } from '../types';

interface AnnouncementCalendarViewProps {
  announcements: Announcement[];
  onSelectAnnouncement: (announcement: Announcement) => void;
}

export function AnnouncementCalendarView({
  announcements,
  onSelectAnnouncement,
}: AnnouncementCalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Filter announcements with valid eventStartDate
  const scheduledAnnouncements = React.useMemo(() => {
    return announcements.filter((a) => a.eventStartDate !== null);
  }, [announcements]);

  // Calendar calculations (Monday as first day of week)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Day index: 0 = Sun, 1 = Mon ... In Indonesia Monday is first day: (day + 6) % 7
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Previous month trailing days
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startDayOffset - 1; i >= 0; i--) {
    days.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(currentYear, currentMonth, i),
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full 35 or 42 grid
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(currentYear, currentMonth + 1, i),
      isCurrentMonth: false,
    });
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Find announcements on a specific date
  const getEventsForDate = React.useCallback(
    (date: Date) => {
      return scheduledAnnouncements.filter((a) => {
        if (!a.eventStartDate) return false;
        const eventDate = new Date(a.eventStartDate);
        return isSameDay(eventDate, date);
      });
    },
    [scheduledAnnouncements]
  );

  const selectedDateEvents = React.useMemo(() => {
    return getEventsForDate(selectedDate);
  }, [selectedDate, getEventsForDate]);

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const weekDayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const today = new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left/Main Column: Calendar Grid (8 cols) */}
      <Card className="lg:col-span-8 shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 px-5 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarIcon className="size-4" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={handleToday}
              className="text-xs h-7 px-2.5 font-medium"
            >
              Hari Ini
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handlePrevMonth}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleNextMonth}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-border/40 text-center text-[11px] font-semibold text-muted-foreground bg-muted/20 py-2">
            {weekDayNames.map((dayName) => (
              <div key={dayName}>{dayName}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border/40 border-b border-border/40">
            {days.map(({ date, isCurrentMonth }, idx) => {
              const events = getEventsForDate(date);
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-22.5 sm:min-h-26.25 p-1.5 sm:p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                    !isCurrentMonth ? 'bg-muted/10 text-muted-foreground/40' : 'bg-card'
                  } ${isSelected ? 'ring-2 ring-primary ring-inset z-10' : 'hover:bg-muted/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center size-6 rounded-full ${
                        isToday
                          ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                          : isSelected
                            ? 'text-primary font-bold'
                            : isCurrentMonth
                              ? 'text-foreground'
                              : 'text-muted-foreground/40'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {events.length > 0 && (
                      <span className="text-[10px] font-medium px-1 rounded-full bg-primary/10 text-primary">
                        {events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges list */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {events.slice(0, 2).map((event) => {
                      let badgeColor = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
                      if (event.category === 'URGENT') {
                        badgeColor = 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30';
                      } else if (event.category === 'ACTIVITY') {
                        badgeColor = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                      }

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAnnouncement(event);
                          }}
                          className={`truncate text-[10px] font-medium px-1.5 py-0.5 rounded border transition-opacity hover:opacity-80 ${badgeColor}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      );
                    })}

                    {events.length > 2 && (
                      <span className="text-[9px] text-muted-foreground font-medium pl-1 block">
                        +{events.length - 2} agenda lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Selected Date Agenda Details (4 cols) */}
      <Card className="lg:col-span-4 shadow-xs border-border/80 sticky top-20">
        <CardHeader className="p-4 px-5 border-b border-border/50 bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Agenda Tanggal</span>
            <Badge variant="outline" className="text-xs font-medium">
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-3 max-h-125 overflow-y-auto">
          {selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs space-y-2">
              <CalendarIcon className="size-8 mx-auto text-muted-foreground/30 stroke-1" />
              <p>Tidak ada agenda kegiatan pada tanggal ini.</p>
            </div>
          ) : (
            selectedDateEvents.map((announcement) => {
              const startDate = announcement.eventStartDate ? new Date(announcement.eventStartDate) : null;
              const endDate = announcement.eventEndDate ? new Date(announcement.eventEndDate) : null;

              return (
                <div
                  key={announcement.id}
                  onClick={() => onSelectAnnouncement(announcement)}
                  className="p-3 rounded-lg border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer space-y-2 text-xs group"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <AnnouncementCategoryBadge category={announcement.category} />
                      <AnnouncementTargetBadge
                        targetType={announcement.targetType}
                        divisionName={announcement.targetDivision?.name}
                        subunitName={announcement.targetSubunit?.name}
                        cluster={announcement.targetCluster}
                      />
                    </div>
                    <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {announcement.title}
                  </h4>

                  <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    {startDate && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3 text-primary shrink-0" />
                        <span>
                          {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {endDate &&
                            ` - ${endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`}
                        </span>
                      </div>
                    )}

                    {announcement.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-destructive shrink-0" />
                        <span className="truncate">{announcement.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

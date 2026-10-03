'use client';

import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Notification = {
  id: string;
  avatar?: string;
  fallback: string;
  text: string;
  time: string;
};

export function NotificationsPopover({
  notifications = [],
}: {
  notifications?: Notification[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Buka notifikasi"
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer relative"
          size="icon"
          variant="ghost"
        >
          <Bell className="size-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-2xl p-2 shadow-lg" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="font-semibold text-xs p-0 text-foreground">
            Notifikasi
          </DropdownMenuLabel>
          <span className="text-3xs text-muted-foreground font-mono">
            {notifications.length} Baru
          </span>
        </div>
        <DropdownMenuSeparator className="my-1" />
        {notifications.length > 0 ? (
          notifications.map(({ id, avatar, fallback, text, time }) => (
            <DropdownMenuItem className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer" key={id}>
              <Avatar className="size-8">
                {avatar && <AvatarImage alt="Avatar" src={avatar} />}
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-xs text-foreground truncate">{text}</span>
                <span className="text-muted-foreground text-3xs">{time}</span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="py-6 px-4 text-center space-y-1">
            <div className="size-8 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground mb-1.5">
              <Bell className="size-4" />
            </div>
            <p className="font-medium text-xs text-foreground">Tidak ada notifikasi baru</p>
            <p className="text-2xs text-muted-foreground">Pemberitahuan aktivitas akan muncul di sini.</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

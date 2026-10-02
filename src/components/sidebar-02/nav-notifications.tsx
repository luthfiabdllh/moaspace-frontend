'use client';

import { BellIcon } from 'lucide-react';
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
          aria-label="Open notifications"
          className="rounded-full cursor-pointer"
          size="icon"
          variant="ghost"
        >
          <BellIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="my-6 w-80" side="right">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map(({ id, avatar, fallback, text, time }) => (
            <DropdownMenuItem className="flex items-start gap-3" key={id}>
              <Avatar className="size-8">
                {avatar && <AvatarImage alt="Avatar" src={avatar} />}
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{text}</span>
                <span className="text-muted-foreground text-xs">{time}</span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Tidak ada notifikasi baru
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-muted-foreground text-sm hover:text-primary cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

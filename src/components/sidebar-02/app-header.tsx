'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationsPopover } from '@/components/sidebar-02/nav-notifications';
import { useLogout } from '@/features/auth/api/use-mutations';
import { useCurrentUser } from '@/features/auth/api/use-queries';

interface AppHeaderProps {
  userName: string;
  roleName?: string;
  logoutLabel?: string;
}

export function AppHeader({
  userName,
  roleName = 'Anggota',
  logoutLabel = 'Sign out',
}: AppHeaderProps) {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { data: user } = useCurrentUser();

  const displayName = user?.name || userName;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate dynamic breadcrumb items
  const breadcrumbItems = (() => {
    if (pathname === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard', isCurrent: true }];
    }

    const segments = pathname.split('/').filter(Boolean);
    const items: { label: string; href?: string; isCurrent: boolean }[] = [];

    // Map segments to friendly Indonesian labels
    const routeMap: Record<string, string> = {
      dashboard: 'Dashboard',
      board: 'Papan Kanban',
      epics: 'Inisiatif & Epics',
      requests: 'Request Antar Divisi',
      new: 'Buat Baru',
      'my-tasks': 'Tugas Saya',
      admin: 'Administrasi',
      users: 'Kelola Anggota',
      divisions: 'Kelola Divisi',
      'activity-logs': 'Activity Log',
      profile: 'Profil Saya',
      settings: 'Pengaturan',
      d: 'Divisi',
      capacity: 'Kapasitas Tim',
      stories: 'Stories & Backlog',
    };

    let accumulatedPath = '';
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      accumulatedPath += `/${seg}`;
      const isLast = i === segments.length - 1;
      const label =
        routeMap[seg] ||
        seg
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

      items.push({
        label,
        href: isLast ? undefined : accumulatedPath,
        isCurrent: isLast,
      });
    }

    return items;
  })();

  return (
    <header
      id="dashboard-header"
      className="bg-background/95 backdrop-blur-md border-border sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear"
      aria-label="Dashboard header"
    >
      {/* Left side: Mobile trigger, separator, breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger
          className="md:hidden"
          aria-label="Toggle sidebar navigation"
        />
        <Separator orientation="vertical" className="mr-1 h-4 md:hidden" />

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
                  MoaSpace
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => (
              <span key={item.label + index} className="inline-flex items-center gap-1.5">
                <BreadcrumbSeparator>
                  <ChevronRight className="size-3.5 text-muted-foreground/60" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isCurrent || !item.href ? (
                    <BreadcrumbPage className="text-xs font-semibold text-foreground">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="text-xs text-muted-foreground hover:text-foreground">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile current page title */}
        <span className="sm:hidden font-semibold text-sm truncate text-foreground">
          {breadcrumbItems[breadcrumbItems.length - 1]?.label || 'MoaSpace'}
        </span>
      </div>

      {/* Right side: Notifications, Theme toggle, User badge, Logout button */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <NotificationsPopover />
        <ThemeToggle />

        <div className="hidden lg:flex flex-col text-right ml-1">
          <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-36">
            {displayName}
          </span>
          <span className="text-3xs text-muted-foreground leading-tight">
            {roleName}
          </span>
        </div>

        <Avatar className="size-8 ring-1 ring-border" aria-label={`Logged in as ${displayName}`}>
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <Button
          id="logout-button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          aria-label={logoutLabel}
          title={logoutLabel}
        >
          <LogOut className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

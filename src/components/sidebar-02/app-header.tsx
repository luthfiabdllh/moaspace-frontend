'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LogOut,
  ChevronRight,
  ChevronsUpDown,
  User as UserIcon,
  Check,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationsPopover } from '@/components/sidebar-02/nav-notifications';
import { Logo } from '@/components/sidebar-02/logo';
import { useLogout } from '@/features/auth/api/use-mutations';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { cn } from '@/lib/utils';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const logoutMutation = useLogout();
  const { data: user } = useCurrentUser();
  const { data: allDivisions = [] } = useDivisions();

  const isAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const userDivisions = useMemo(() => user?.divisions ?? [], [user]);

  const queryDivision = searchParams?.get('division');
  const userPrimaryDivision = userDivisions[0]?.divisionSlug || (isAdmin ? allDivisions[0]?.slug : undefined);
  const activeDivisionSlug = queryDivision || userPrimaryDivision;

  const divisionsList = useMemo(() => {
    if (isAdmin && allDivisions.length > 0) {
      return allDivisions.map((div) => {
        const userDiv = userDivisions.find((ud) => ud.divisionId === div.id);
        return {
          name: div.name,
          slug: div.slug,
          role: userDiv?.role === 'COORDINATOR' ? 'Koordinator' : isAdmin ? 'Admin' : 'Anggota',
        };
      });
    }
    return userDivisions.map((div) => ({
      name: div.divisionName,
      slug: div.divisionSlug,
      role: div.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota',
    }));
  }, [isAdmin, allDivisions, userDivisions]);

  const activeDivision = divisionsList.find((d) => d.slug === activeDivisionSlug) || divisionsList[0];
  const activeDivisionName = activeDivision?.name;

  const displayName = user?.name || userName;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const userRoleLabel = user?.isSuperAdmin
    ? 'Super Admin'
    : user?.isKormanit
      ? 'Kormanit'
      : activeDivision?.role || roleName;

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
      announcements: 'Pengumuman',
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

      {/* Right side: Notifications, Theme toggle, Profile Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <NotificationsPopover />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 px-2 sm:px-2.5 rounded-lg border border-border/60 hover:bg-muted/60 data-[state=open]:bg-muted/80 transition-colors cursor-pointer flex items-center gap-2 select-none"
              aria-label={`Menu profil ${displayName}`}
            >
              <Avatar className="size-7.5 rounded-lg shrink-0 border border-border/40">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden sm:grid flex-1 text-left text-xs leading-tight min-w-0 max-w-36">
                <span className="truncate font-semibold text-foreground">{displayName}</span>
                <span className="truncate text-3xs text-muted-foreground">
                  {activeDivisionName || userRoleLabel}
                </span>
              </div>

              <ChevronsUpDown className="size-3.5 text-muted-foreground/70 shrink-0 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 rounded-xl p-2 shadow-lg"
          >
            {/* User Info Header */}
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40">
              <Avatar className="size-9 rounded-lg ring-1 ring-border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground truncate">
                  {displayName}
                </span>
                <span className="text-3xs text-muted-foreground truncate">
                  {user?.email || ''}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Badge
                    variant="outline"
                    className="text-3xs py-0 px-1.5 font-medium border-primary/20 text-primary bg-primary/5"
                  >
                    {user?.isSuperAdmin
                      ? 'Super Admin'
                      : user?.isKormanit
                        ? 'Kormanit'
                        : userRoleLabel}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Division Switcher list */}
            {divisionsList.length > 0 && (
              <>
                <DropdownMenuSeparator className="my-1.5" />
                <div className="flex items-center justify-between px-2 py-1">
                  <DropdownMenuLabel className="p-0 text-3xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ganti Divisi Kerja
                  </DropdownMenuLabel>
                  <span className="text-3xs text-muted-foreground font-mono">
                    {divisionsList.length} Divisi
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {divisionsList.map((div) => {
                    const isActive = div.slug === activeDivisionSlug;
                    return (
                      <DropdownMenuItem
                        key={div.slug || div.name}
                        onClick={() => {
                          if (div.slug) {
                            router.push(`/board?division=${div.slug}&tab=kanban`);
                          }
                        }}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs',
                          isActive && 'bg-primary/10 text-primary font-medium'
                        )}
                      >
                        <div className="flex size-5 items-center justify-center rounded border bg-background shrink-0">
                          <Logo className="size-3" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate">{div.name}</span>
                          {div.role && (
                            <span className="text-3xs text-muted-foreground truncate">
                              {div.role}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <Check className="size-3.5 text-primary shrink-0 ml-auto" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </>
            )}

            <DropdownMenuSeparator className="my-1.5" />

            {/* Account Navigation */}
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground"
              >
                <UserIcon className="size-4 text-muted-foreground" />
                <span>Profil Saya</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />

            {/* Logout */}
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span>{logoutMutation.isPending ? 'Keluar...' : logoutLabel}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Target,
  GitPullRequest,
  CheckSquare,
  Shield,
  Users,
  Layers,
  History,
  User,
  Settings,
  PlusCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/sidebar-02/logo';
import type { Route } from '@/components/sidebar-02/nav-main';
import DashboardNavigation from '@/components/sidebar-02/nav-main';
import { NotificationsPopover } from '@/components/sidebar-02/nav-notifications';
import { TeamSwitcher, type Team } from '@/components/sidebar-02/team-switcher';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const { data: user } = useCurrentUser();
  const { data: allDivisions = [] } = useDivisions();

  const isAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const userDivisions = user?.divisions ?? [];

  // Detect division slug from URL (/d/[slug]/...)
  const divisionSlugMatch = pathname.match(/^\/d\/([^/]+)/);
  const activeDivisionSlug = divisionSlugMatch ? divisionSlugMatch[1] : undefined;

  // Build teams list for the division switcher
  const teams: Team[] = useMemo(() => {
    if (userDivisions.length > 0) {
      return userDivisions.map((div) => ({
        name: div.divisionName,
        slug: div.divisionSlug,
        plan: div.role === 'COORDINATOR' ? 'Koordinator Divisi' : 'Anggota',
      }));
    }

    if (isAdmin && allDivisions.length > 0) {
      return allDivisions.map((div) => ({
        name: div.name,
        slug: div.slug,
        plan: 'Admin Unit',
      }));
    }

    return [{ name: 'MoaSpace KKN', plan: 'Unit KKN' }];
  }, [userDivisions, isAdmin, allDivisions]);

  // Real MoaSpace routes categorized with clean groups and accurate active states
  const dashboardRoutes: Route[] = useMemo(() => {
    const routes: Route[] = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <LayoutDashboard className="size-4" />,
        link: '/dashboard',
        isActive: pathname === '/dashboard',
        group: 'MAIN',
      },
      {
        id: 'board',
        title: 'Papan Kanban',
        icon: <FolderKanban className="size-4" />,
        link: '/board',
        isActive: pathname === '/board',
        group: 'MAIN',
      },
      {
        id: 'epics',
        title: 'Inisiatif & Epics',
        icon: <Target className="size-4" />,
        link: '/epics',
        isActive: pathname === '/epics' || pathname.startsWith('/epics/'),
        group: 'MAIN',
      },
      {
        id: 'requests',
        title: 'Request Antar Divisi',
        icon: <GitPullRequest className="size-4" />,
        link: '/requests',
        isActive: pathname.startsWith('/requests'),
        group: 'MAIN',
        subs: [
          {
            title: 'Semua Request',
            link: '/requests',
            icon: <GitPullRequest className="size-4" />,
            isActive: pathname === '/requests',
          },
          {
            title: 'Buat Request Baru',
            link: '/requests/new',
            icon: <PlusCircle className="size-4" />,
            isActive: pathname === '/requests/new',
          },
        ],
      },
      {
        id: 'my-tasks',
        title: 'Tugas Saya',
        icon: <CheckSquare className="size-4" />,
        link: '/my-tasks',
        isActive: pathname === '/my-tasks' || pathname.startsWith('/my-tasks/'),
        group: 'MAIN',
      },
    ];

    // If currently inside a division, show contextual division sub-routes
    if (activeDivisionSlug) {
      const activeDiv =
        teams.find((t) => t.slug === activeDivisionSlug) ||
        allDivisions.find((d) => d.slug === activeDivisionSlug);
      const divisionName = activeDiv ? activeDiv.name : activeDivisionSlug;

      routes.push({
        id: 'current-division',
        title: `Divisi ${divisionName}`,
        icon: <Layers className="size-4" />,
        link: `/d/${activeDivisionSlug}/board`,
        isActive: pathname.startsWith(`/d/${activeDivisionSlug}`),
        group: 'Papan Divisi',
        subs: [
          {
            title: 'Kanban Divisi',
            link: `/d/${activeDivisionSlug}/board`,
            icon: <FolderKanban className="size-4" />,
            isActive:
              pathname === `/d/${activeDivisionSlug}/board` ||
              pathname === `/d/${activeDivisionSlug}`,
          },
          {
            title: 'Stories & Backlog',
            link: `/d/${activeDivisionSlug}/stories`,
            icon: <CheckSquare className="size-4" />,
            isActive: pathname.startsWith(`/d/${activeDivisionSlug}/stories`),
          },
          {
            title: 'Kapasitas Tim',
            link: `/d/${activeDivisionSlug}/capacity`,
            icon: <Users className="size-4" />,
            isActive: pathname.startsWith(`/d/${activeDivisionSlug}/capacity`),
          },
        ],
      });
    }

    // Admin Routes
    if (isAdmin) {
      routes.push({
        id: 'admin',
        title: 'Administrasi',
        icon: <Shield className="size-4" />,
        link: '/admin/users',
        isActive: pathname.startsWith('/admin'),
        group: 'Administrasi',
        subs: [
          {
            title: 'Kelola Anggota',
            link: '/admin/users',
            icon: <Users className="size-4" />,
            isActive:
              pathname === '/admin/users' ||
              pathname.startsWith('/admin/users/'),
          },
          {
            title: 'Kelola Divisi',
            link: '/admin/divisions',
            icon: <Layers className="size-4" />,
            isActive:
              pathname === '/admin/divisions' ||
              pathname.startsWith('/admin/divisions/'),
          },
          {
            title: 'Activity Log',
            link: '/admin/activity-logs',
            icon: <History className="size-4" />,
            isActive: pathname.startsWith('/admin/activity-logs'),
          },
        ],
      });
    }

    // Profile & Settings
    routes.push(
      {
        id: 'profile',
        title: 'Profil Saya',
        icon: <User className="size-4" />,
        link: '/profile',
        isActive: pathname === '/profile',
        group: 'Akun',
      },
      {
        id: 'settings',
        title: 'Pengaturan',
        icon: <Settings className="size-4" />,
        link: '/settings',
        isActive: pathname === '/settings',
        group: 'Akun',
      }
    );

    return routes;
  }, [pathname, activeDivisionSlug, teams, allDivisions, isAdmin]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader
        className={cn(
          'flex md:pt-3.5',
          isCollapsed
            ? 'flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start'
            : 'flex-row items-center justify-between'
        )}
      >
        <Link className="flex items-center gap-2" href="/dashboard">
          <Logo className="h-8 w-8" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              MoaSpace
            </span>
          )}
        </Link>

        <motion.div
          animate={{ opacity: 1 }}
          className={cn(
            'flex items-center gap-2',
            isCollapsed ? 'flex-row md:flex-col-reverse' : 'flex-row'
          )}
          initial={{ opacity: 0 }}
          key={isCollapsed ? 'header-collapsed' : 'header-expanded'}
          transition={{ duration: 0.8 }}
        >
          <NotificationsPopover />
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>

      <SidebarFooter className="px-2">
        <TeamSwitcher teams={teams} activeSlug={activeDivisionSlug} />
      </SidebarFooter>
    </Sidebar>
  );
}

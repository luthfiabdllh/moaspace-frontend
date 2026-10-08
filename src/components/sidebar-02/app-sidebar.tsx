'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  const userDivisions = useMemo(() => user?.divisions ?? [], [user]);

  // Detect division slug from query param (?division=...) or fallback to user primary division
  const searchParams = useSearchParams();
  const queryDivision = searchParams?.get('division');
  const userPrimaryDivision = userDivisions[0]?.divisionSlug || (isAdmin ? allDivisions[0]?.slug : undefined);
  const activeDivisionSlug = queryDivision || userPrimaryDivision;

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
        title: 'Papan Kerja Divisi',
        icon: <FolderKanban className="size-4" />,
        link: activeDivisionSlug ? `/board?division=${activeDivisionSlug}` : '/board',
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
  }, [pathname, activeDivisionSlug, isAdmin]);

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
          className="flex items-center"
          initial={{ opacity: 0 }}
          key={isCollapsed ? 'header-collapsed' : 'header-expanded'}
          transition={{ duration: 0.8 }}
        >
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

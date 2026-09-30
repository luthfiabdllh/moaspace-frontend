'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Settings,
  Users,
  History,
  Layers,
  FolderKanban,
  Award,
  Target,
  CheckSquare,
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useUIStore();
  const { data: user } = useCurrentUser();

  const isAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const userDivisions = user?.divisions ?? [];

  const mainNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { key: 'epics', label: 'Inisiatif & Epics', icon: Target, href: '/epics' },
    { key: 'my-tasks', label: 'Tugas Saya', icon: CheckSquare, href: '/my-tasks' },
    ...(isAdmin
      ? [
          { key: 'admin-users', label: 'Kelola Anggota', icon: Users, href: '/admin/users' },
          { key: 'admin-divisions', label: 'Kelola Divisi', icon: Layers, href: '/admin/divisions' },
          { key: 'admin-activity-logs', label: 'Activity Log', icon: History, href: '/admin/activity-logs' },
        ]
      : []),
    { key: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside
      id="dashboard-sidebar"
      aria-label="Dashboard navigation sidebar"
      className={cn(
        'bg-card border-border flex flex-col border-r transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
          M
        </div>
        {isSidebarOpen && (
          <span className="ml-3 font-semibold truncate text-foreground">MoaSpace</span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Navigation */}
        <nav aria-label="Main navigation" className="space-y-1">
          {mainNavItems.map(({ key, label, icon: Icon, href }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={key}
                href={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon size={18} aria-hidden="true" className="shrink-0" />
                {isSidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Divisi Saya (Dinamis dari Keanggotaan User) */}
        {userDivisions.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            {isSidebarOpen ? (
              <div className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Divisi Saya
              </div>
            ) : (
              <div className="h-2" />
            )}

            <nav aria-label="Divisi navigation" className="space-y-1">
              {userDivisions.map((div) => {
                const href = `/d/${div.divisionSlug}`;
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                const isCoordinator = div.role === 'COORDINATOR';

                return (
                  <Link
                    key={div.divisionId}
                    href={href}
                    aria-label={div.divisionName}
                    title={div.divisionName}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderKanban size={17} aria-hidden="true" className="shrink-0 text-indigo-500" />
                      {isSidebarOpen && (
                        <span className="truncate text-xs">{div.divisionName}</span>
                      )}
                    </div>
                    {isSidebarOpen && isCoordinator && (
                      <span title="Koordinator Divisi">
                        <Award size={13} className="text-amber-500 shrink-0" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}

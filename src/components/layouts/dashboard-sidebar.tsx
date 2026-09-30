'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Settings, Users } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { cn } from '@/lib/utils';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useUIStore();
  const { data: user } = useCurrentUser();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    ...(user?.isSuperAdmin
      ? [{ key: 'admin-users', label: 'Kelola Anggota', icon: Users, href: '/admin/users' }]
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
          <span className="ml-3 font-semibold truncate">MoaSpace</span>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">
        {navItems.map(({ key, label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={key}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon size={18} aria-hidden="true" className="shrink-0" />
              {isSidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

'use client';

import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUIStore } from '@/store/ui.store';
import { useLogout } from '@/features/auth/api/use-mutations';

interface DashboardHeaderProps {
  userName: string;
  logoutLabel?: string;
}

export function DashboardHeader({
  userName,
  logoutLabel = 'Sign out',
}: DashboardHeaderProps) {
  const { toggleSidebar } = useUIStore();
  const logoutMutation = useLogout();

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      id="dashboard-header"
      className="bg-background border-border flex h-16 items-center justify-between border-b px-4"
      aria-label="Dashboard header"
    >
      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar navigation"
        aria-expanded={useUIStore.getState().isSidebarOpen}
        aria-controls="dashboard-sidebar"
      >
        <Menu size={20} aria-hidden="true" />
      </Button>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme mode toggle */}
        <ThemeToggle />

        {/* User avatar */}
        <Avatar aria-label={`Logged in as ${userName}`}>
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="hidden text-sm font-medium sm:block">{userName}</span>

        {/* Logout button */}
        <Button
          id="logout-button"
          variant="ghost"
          size="icon"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          aria-label={logoutLabel}
        >
          <LogOut size={18} aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

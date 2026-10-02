'use client';

import * as React from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/sidebar-02/app-sidebar';
import { AppHeader } from '@/components/sidebar-02/app-header';

export interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  roleName?: string;
}

export function AppShell({ children, userName, roleName }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col min-w-0 overflow-hidden">
          <AppHeader userName={userName} roleName={roleName} />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            aria-label="Konten Utama"
          >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default AppShell;
export { DashboardSidebar, AppHeader };

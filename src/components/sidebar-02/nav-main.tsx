'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuItem as SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export type Route = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  link: string;
  isActive?: boolean;
  group?: string;
  subs?: {
    title: string;
    link: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
};

export default function DashboardNavigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const activeParentId =
    routes.find((r) => r.subs?.some((s) => s.isActive))?.id ?? null;
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(
    activeParentId
  );

  useEffect(() => {
    if (activeParentId) {
      setOpenCollapsible(activeParentId);
    }
  }, [activeParentId]);

  // Group routes by group field if provided
  const groupedRoutes = routes.reduce<Record<string, Route[]>>((acc, route) => {
    const groupName = route.group || 'MAIN';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(route);
    return acc;
  }, {});

  const renderRoute = (route: Route) => {
    const isOpen = !isCollapsed && openCollapsible === route.id;
    const hasSubRoutes = !!route.subs?.length;
    const hasActiveSub = route.subs?.some((s) => s.isActive);
    const isParentActive = !hasActiveSub && Boolean(route.isActive);

    return (
      <SidebarMenuItem key={route.id}>
        {hasSubRoutes ? (
          <Collapsible
            className="w-full"
            onOpenChange={(open) =>
              setOpenCollapsible(open ? route.id : null)
            }
            open={isOpen}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={isParentActive}
                className={cn(
                  'flex w-full items-center rounded-lg px-2.5 py-2 transition-colors cursor-pointer',
                  isParentActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : isOpen
                      ? 'bg-sidebar-muted text-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground',
                  isCollapsed && 'justify-center'
                )}
              >
                {route.icon}
                {!isCollapsed && (
                  <span className="ml-2.5 flex-1 font-medium text-sm">
                    {route.title}
                  </span>
                )}
                {!isCollapsed && hasSubRoutes && (
                  <span className="ml-auto text-muted-foreground">
                    {isOpen ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </span>
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>

            {!isCollapsed && (
              <CollapsibleContent>
                <SidebarMenuSub className="my-1.5 ml-3.5 flex flex-col gap-1 border-l border-sidebar-border/60 pl-3">
                  {route.subs?.map((subRoute) => (
                    <SidebarMenuSubItem
                      className="h-auto"
                      key={`${route.id}-${subRoute.title}`}
                    >
                      <SidebarMenuSubButton asChild isActive={subRoute.isActive}>
                        <Link
                          className={cn(
                            'flex items-center rounded-md px-3 py-1.5 font-medium text-sm transition-colors',
                            subRoute.isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                              : 'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground'
                          )}
                          href={subRoute.link}
                          prefetch={true}
                        >
                          {subRoute.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </Collapsible>
        ) : (
          <SidebarMenuButton asChild tooltip={route.title} isActive={route.isActive}>
            <Link
              className={cn(
                'flex items-center rounded-lg px-2.5 py-2 transition-colors',
                route.isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground',
                isCollapsed && 'justify-center'
              )}
              href={route.link}
              prefetch={true}
            >
              {route.icon}
              {!isCollapsed && (
                <span className="ml-2.5 font-medium text-sm">
                  {route.title}
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(groupedRoutes).map(([groupName, groupRoutes]) => {
        const isMainGroup = groupName === 'MAIN' || groupName === 'Menu Utama';
        return (
          <SidebarGroup key={groupName} className="p-0">
            {!isMainGroup && !isCollapsed && (
              <SidebarGroupLabel className="h-6 px-2.5 pt-2 pb-0.5 text-[11px] font-medium tracking-normal text-sidebar-foreground/60 select-none">
                {groupName}
              </SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-1.5">
              {groupRoutes.map(renderRoute)}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </div>
  );
}

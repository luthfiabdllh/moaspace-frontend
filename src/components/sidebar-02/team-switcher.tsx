'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/sidebar-02/logo';

export type Team = {
  name: string;
  logo?: React.ElementType;
  plan?: string;
  slug?: string;
};

export function TeamSwitcher({
  teams,
  activeSlug,
}: {
  teams: Team[];
  activeSlug?: string;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const activeTeam =
    (activeSlug ? teams.find((t) => t.slug === activeSlug) : null) ||
    teams[0] || {
      name: 'MoaSpace KKN',
      plan: 'Unit KKN',
    };

  const LogoComponent = activeTeam.logo || Logo;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              size="lg"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-foreground border border-border/40">
                <LogoComponent className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTeam.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeTeam.plan || 'Divisi KKN'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="mb-4 w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Divisi KKN
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                key={team.slug || team.name}
                onClick={() => {
                  if (team.slug) {
                    router.push(`/board?division=${team.slug}&tab=kanban`);
                  }
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                  {team.logo ? (
                    <team.logo className="size-4 shrink-0" />
                  ) : (
                    <Logo className="size-4 shrink-0" />
                  )}
                </div>
                <span className="truncate flex-1">{team.name}</span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Orbit,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export type NavLeaf = {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export type NavGroup = {
  label: string
  items: NavLeaf[]
}

export function AppSidebar({
  groups,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  groups: NavGroup[]
}) {
  const pathname = usePathname() ?? ''

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-sidebar-border/80 bg-sidebar"
      {...props}
    >
      <SidebarHeader className="gap-2 px-5 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/bridge">
                <div className="flex aspect-square size-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_30%,hsl(var(--sidebar-glow)),hsl(var(--sidebar-primary))_62%)] text-sidebar-primary-foreground shadow-[0_18px_40px_hsl(var(--sidebar-primary)/0.25)]">
                  <Orbit className="size-4.5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-[16px] font-semibold tracking-tight text-sidebar-foreground">USS</span>
                  <span className="truncate text-[11px] uppercase tracking-[0.24em] text-sidebar-foreground/42">OpenClaw Command Center</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden">
          <p className="max-w-[15rem] text-sm leading-6 text-sidebar-foreground/56">
            Command surface for fleet health, agent operations, and task flow.
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-6 px-3 pb-5">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="px-0">
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-sidebar-foreground/34">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="h-11 rounded-2xl px-3 text-[15px] font-medium text-sidebar-foreground/74 transition-all before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-transparent data-[active=true]:bg-sidebar-accent/95 data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[0_1px_0_hsl(var(--sidebar-border)),0_12px_30px_hsl(var(--foreground)/0.04)] data-[active=true]:before:bg-sidebar-primary hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                    >
                      <Link href={item.href}>
                        <Icon className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/52'} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

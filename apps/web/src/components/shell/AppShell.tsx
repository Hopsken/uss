'use client'

import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar, type NavGroup } from '@/components/app-sidebar'

export function AppShell({
  children,
  navigationGroups,
}: {
  children: ReactNode
  navigationGroups: NavGroup[]
  activePath: string
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar groups={navigationGroups} />
      <SidebarInset className="min-h-screen min-w-0 overflow-x-hidden bg-[linear-gradient(180deg,hsl(var(--shell-canvas))_0%,hsl(var(--background))_68%)]">
        <div className="pointer-events-none fixed left-4 top-4 z-30 md:hidden">
          <SidebarTrigger className="pointer-events-auto rounded-2xl border border-border/70 bg-background/94 shadow-sm backdrop-blur" />
        </div>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

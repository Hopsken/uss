import type { ReactNode } from 'react'
import { MainNav } from './MainNav'

export interface NavItem {
  label: string
  href: string
  isActive?: boolean
}

export interface AppShellProps {
  children: ReactNode
  navigationItems: NavItem[]
  onNavigate?: (href: string) => void
}

export function AppShell({ children, navigationItems, onNavigate }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-[Inter,sans-serif]">
      <MainNav items={navigationItems} onNavigate={onNavigate} />
      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}

'use client'

import {
  Activity,
  Bot,
  CalendarDays,
  Gauge,
  Puzzle,
  Radio,
  RefreshCcw,
  Settings,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/shell'

const NAV_GROUPS = [
  {
    label: 'Command',
    items: [
      { label: 'Bridge', href: '/bridge', icon: Radio, description: 'Fleet overview' },
      { label: 'Agents', href: '/agents', icon: Bot, description: 'Crew roster' },
      { label: 'Activity', href: '/activity', icon: Activity, description: 'Live event feed' },
      { label: 'Usage', href: '/usage', icon: Gauge, description: 'Spend and tokens' },
    ],
  },
  {
    label: 'Operate',
    items: [
      { label: 'Automation', href: '/automation', icon: RefreshCcw, description: 'Recurring work' },
      { label: 'Agenda', href: '/agenda', icon: CalendarDays, description: 'One-time tasks' },
      { label: 'Skills', href: '/skills', icon: Puzzle, description: 'Skill registry' },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', href: '/settings', icon: Settings, description: 'Security and auth' }],
  },
]

export function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAuthRoute = pathname.startsWith('/auth')

  if (isAuthRoute) {
    return <>{children}</>
  }

  return <AppShell navigationGroups={NAV_GROUPS} activePath={pathname}>{children}</AppShell>
}

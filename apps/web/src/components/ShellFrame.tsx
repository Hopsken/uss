'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/shell'

const NAV_ITEMS = [
  { label: 'Bridge', href: '/bridge' },
  { label: 'Agents', href: '/agents' },
  { label: 'Automation', href: '/automation' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Activity', href: '/activity' },
  { label: 'Usage', href: '/usage' },
  { label: 'Skills', href: '/skills' },
  { label: 'Settings', href: '/settings' },
]

export function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAuthRoute = pathname.startsWith('/auth')

  const items = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }))

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <AppShell navigationItems={items} onNavigate={(href) => router.push(href)}>
      {children}
    </AppShell>
  )
}

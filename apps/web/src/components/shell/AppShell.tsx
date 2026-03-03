'use client'

import { Box } from '@mantine/core'
import type { ReactNode } from 'react'
import { MainNav } from './MainNav'
import type { NavItem } from './types'

export function AppShell({
  children,
  navigationItems,
  onNavigate,
}: {
  children: ReactNode
  navigationItems: NavItem[]
  onNavigate?: (href: string) => void
}) {
  return (
    <Box
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <MainNav items={navigationItems} onNavigate={onNavigate} />
      <Box component="main" className="uss-main-content">
        {children}
      </Box>
    </Box>
  )
}

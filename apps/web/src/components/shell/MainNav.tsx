'use client'

import {
  ActionIcon,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { useState } from 'react'
import {
  Activity,
  BarChart3,
  Bot,
  CalendarDays,
  LayoutDashboard,
  Puzzle,
  Radio,
  RefreshCcw,
  Settings,
} from 'lucide-react'
import type { NavItem } from './types'

const ICON_MAP = {
  bridge: LayoutDashboard,
  agents: Bot,
  automation: RefreshCcw,
  agenda: CalendarDays,
  activity: Activity,
  usage: BarChart3,
  skills: Puzzle,
  settings: Settings,
}

function NavButton({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: (href: string) => void
}) {
  const Icon = ICON_MAP[item.label.toLowerCase() as keyof typeof ICON_MAP] ?? LayoutDashboard

  const content = (
    <UnstyledButton
      className="uss-nav-btn"
      data-active={item.isActive ? 'true' : undefined}
      onClick={() => onNavigate?.(item.href)}
      style={{
        width: '100%',
        borderRadius: 10,
        padding: collapsed ? '10px 0' : '10px 12px',
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-start',
        alignItems: 'center',
        gap: 10,
        background: item.isActive ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
        color: item.isActive ? '#0284c7' : '#475569',
        fontWeight: item.isActive ? 600 : 500,
      }}
    >
      <Icon size={16} />
      {!collapsed && <Text size="sm" fw={600} ff="Space Grotesk, system-ui, sans-serif">{item.label}</Text>}
    </UnstyledButton>
  )

  if (!collapsed) return content

  return (
    <Tooltip label={item.label} position="right">
      <Box>{content}</Box>
    </Tooltip>
  )
}

function SidebarContent({
  collapsed,
  mainItems,
  settingsItem,
  onNavigate,
}: {
  collapsed: boolean
  mainItems: NavItem[]
  settingsItem: NavItem | undefined
  onNavigate: (href: string) => void
}) {
  return (
    <>
      <Group justify={collapsed ? 'center' : 'flex-start'} px={collapsed ? 0 : 'xs'} py="xs" mb="sm">
        <ActionIcon variant="light" color="sky" radius="xl">
          <Radio size={16} />
        </ActionIcon>
        {!collapsed && (
          <Text fw={700} ff="Space Grotesk, system-ui, sans-serif" size="lg" c="slate.9">
            USS
          </Text>
        )}
      </Group>

      <Divider mb="sm" />

      <ScrollArea style={{ flex: 1 }}>
        <Stack gap={4}>
          {mainItems.map((item) => (
            <NavButton key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </Stack>
      </ScrollArea>

      {settingsItem && (
        <>
          <Divider my="sm" />
          <NavButton item={settingsItem} collapsed={collapsed} onNavigate={onNavigate} />
        </>
      )}
    </>
  )
}

export function MainNav({
  items,
  onNavigate,
}: {
  items: NavItem[]
  onNavigate?: (href: string) => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const mainItems = items.filter((item) => item.label.toLowerCase() !== 'settings')
  const settingsItem = items.find((item) => item.label.toLowerCase() === 'settings')

  const navigate = (href: string) => {
    onNavigate?.(href)
    setMobileOpen(false)
  }

  const sidebarBase = {
    padding: 8,
    height: '100%',
    background: '#ffffffee',
    borderRight: '1px solid #e2e8f0',
    backdropFilter: 'blur(8px)',
    flexDirection: 'column' as const,
    flexShrink: 0,
  }

  return (
    <>
      {/* Desktop sidebar — 224px, visible ≥75em */}
      <Box
        component="aside"
        className="uss-sidebar-desktop"
        style={{ ...sidebarBase, width: 224 }}
      >
        <SidebarContent
          collapsed={false}
          mainItems={mainItems}
          settingsItem={settingsItem}
          onNavigate={navigate}
        />
      </Box>

      {/* Tablet sidebar — 56px icon-only, visible 48em–75em */}
      <Box
        component="aside"
        className="uss-sidebar-tablet"
        style={{ ...sidebarBase, width: 56 }}
      >
        <SidebarContent
          collapsed={true}
          mainItems={mainItems}
          settingsItem={settingsItem}
          onNavigate={navigate}
        />
      </Box>

      {/* Mobile header — visible <48em */}
      <Box
        component="header"
        className="uss-mobile-header"
        px="md"
        style={{
          height: 56,
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffffee',
          backdropFilter: 'blur(8px)',
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 220,
        }}
      >
        <Group h="100%" justify="space-between" style={{ width: '100%' }}>
          <Group gap="xs">
            <ActionIcon variant="light" color="sky" radius="xl">
              <Radio size={16} />
            </ActionIcon>
            <Text fw={700} ff="Space Grotesk, system-ui, sans-serif" size="lg" c="slate.9">
              USS
            </Text>
          </Group>
          <Burger opened={mobileOpen} onClick={() => setMobileOpen((v) => !v)} size="sm" />
        </Group>
      </Box>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <Box
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 210,
              background: 'rgba(15, 23, 42, 0.4)',
            }}
          />

          {/* Dropdown */}
          <Box
            style={{
              position: 'fixed',
              top: 56,
              left: 0,
              right: 0,
              zIndex: 215,
              background: '#fff',
              borderBottom: '1px solid #e2e8f0',
              padding: 12,
            }}
          >
            <Stack gap={6}>
              {mainItems.map((item) => {
                const Icon = ICON_MAP[item.label.toLowerCase() as keyof typeof ICON_MAP] ?? LayoutDashboard
                return (
                  <Button
                    key={item.href}
                    variant={item.isActive ? 'light' : 'subtle'}
                    color="sky"
                    justify="flex-start"
                    leftSection={<Icon size={16} />}
                    onClick={() => navigate(item.href)}
                  >
                    {item.label}
                  </Button>
                )
              })}
              {settingsItem && (
                <>
                  <Divider />
                  <Button
                    variant={settingsItem.isActive ? 'light' : 'subtle'}
                    color="sky"
                    justify="flex-start"
                    leftSection={<Settings size={16} />}
                    onClick={() => navigate(settingsItem.href)}
                  >
                    {settingsItem.label}
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </>
      )}
    </>
  )
}

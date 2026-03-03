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
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  IconActivity,
  IconBolt,
  IconChartBar,
  IconLayoutDashboard,
  IconListCheck,
  IconPuzzle,
  IconRobot,
  IconSettings,
} from '@tabler/icons-react'
import type { NavItem } from './types'

const ICON_MAP = {
  bridge: IconLayoutDashboard,
  agents: IconRobot,
  tasks: IconListCheck,
  activity: IconActivity,
  usage: IconChartBar,
  skills: IconPuzzle,
  settings: IconSettings,
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
  const Icon = ICON_MAP[item.label.toLowerCase() as keyof typeof ICON_MAP] ?? IconLayoutDashboard

  const content = (
    <UnstyledButton
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
      <Icon size={16} stroke={1.8} />
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

export function MainNav({
  items,
  onNavigate,
}: {
  items: NavItem[]
  onNavigate?: (href: string) => void
}) {
  const [opened, { toggle, close }] = useDisclosure(false)
  const isDesktop = useMediaQuery('(min-width: 75em)')
  const isTablet = useMediaQuery('(min-width: 48em) and (max-width: 74.99em)')

  const mainItems = items.filter((item) => item.label.toLowerCase() !== 'settings')
  const settingsItem = items.find((item) => item.label.toLowerCase() === 'settings')

  const navigate = (href: string) => {
    onNavigate?.(href)
    close()
  }

  if (isDesktop || isTablet) {
    const collapsed = Boolean(isTablet)

    return (
      <Box
        component="aside"
        style={{
          padding: 8,
          height: '100%',
          width: collapsed ? 56 : 224,
          background: '#ffffffee',
          borderRight: '1px solid #e2e8f0',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <Group justify={collapsed ? 'center' : 'flex-start'} px={collapsed ? 0 : 'xs'} py="xs" mb="sm">
          <ActionIcon variant="light" color="sky" radius="xl">
            <IconBolt size={16} />
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
              <NavButton key={item.href} item={item} collapsed={collapsed} onNavigate={navigate} />
            ))}
          </Stack>
        </ScrollArea>

        {settingsItem && (
          <>
            <Divider my="sm" />
            <NavButton item={settingsItem} collapsed={collapsed} onNavigate={navigate} />
          </>
        )}
      </Box>
    )
  }

  return (
    <>
      <Box
        component="header"
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
        <Group h="100%" justify="space-between">
          <Group gap="xs">
            <ActionIcon variant="light" color="sky" radius="xl">
              <IconBolt size={16} />
            </ActionIcon>
            <Text fw={700} ff="Space Grotesk, system-ui, sans-serif" size="lg" c="slate.9">
              USS
            </Text>
          </Group>
          <Burger opened={opened} onClick={toggle} size="sm" />
        </Group>
      </Box>

      {opened && (
        <Box
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            zIndex: 200,
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            padding: 12,
          }}
        >
          <Stack gap={6}>
            {mainItems.map((item) => (
              <Button
                key={item.href}
                variant={item.isActive ? 'light' : 'subtle'}
                color="sky"
                justify="flex-start"
                leftSection={(() => {
                  const Icon = ICON_MAP[item.label.toLowerCase() as keyof typeof ICON_MAP] ?? IconLayoutDashboard
                  return <Icon size={16} />
                })()}
                onClick={() => navigate(item.href)}
              >
                {item.label}
              </Button>
            ))}
            {settingsItem && (
              <>
                <Divider />
                <Button
                  variant={settingsItem.isActive ? 'light' : 'subtle'}
                  color="sky"
                  justify="flex-start"
                  leftSection={<IconSettings size={16} />}
                  onClick={() => navigate(settingsItem.href)}
                >
                  {settingsItem.label}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      )}
    </>
  )
}

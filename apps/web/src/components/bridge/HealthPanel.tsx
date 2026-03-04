'use client'

import { Box, Card, Group, Stack, Text } from '@mantine/core'
import { AlertCircle } from 'lucide-react'
import type { ErrorLevel, OpenClawStatus, ProviderStatus, SystemHealth } from '@uss/shared'

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

function openclawDotColor(status: OpenClawStatus): string {
  if (status === 'running') return 'var(--mantine-color-green-5)'
  if (status === 'stopped') return 'var(--mantine-color-gray-4)'
  return 'var(--mantine-color-red-5)'
}

function providerDotColor(status: ProviderStatus): string {
  if (status === 'healthy') return 'var(--mantine-color-green-5)'
  if (status === 'degraded') return 'var(--mantine-color-amber-5)'
  return 'var(--mantine-color-red-5)'
}

function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <Box
      w={8}
      h={8}
      style={{ borderRadius: '50%', background: color, flexShrink: 0 }}
      className={pulse ? 'uss-status-busy' : undefined}
    />
  )
}

export function HealthPanel({ health }: { health: SystemHealth }) {
  const { openclaw, providers, recentErrors } = health

  return (
    <Stack gap="sm">
      {/* OpenClaw card */}
      <Card withBorder radius="md" p="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Dot color={openclawDotColor(openclaw.status)} pulse={openclaw.status === 'running'} />
            <Box>
              <Text size="xs" c="dimmed">OpenClaw</Text>
              <Text size="sm" fw={600}>
                {openclaw.status === 'running' ? 'Running' : openclaw.status === 'stopped' ? 'Stopped' : 'Error'}
              </Text>
            </Box>
          </Group>
          <Box style={{ textAlign: 'right' }}>
            <Text size="xs" c="dimmed" ff="var(--font-mono)">v{openclaw.version}</Text>
            <Text size="xs" c="dimmed" ff="var(--font-mono)">{formatUptime(openclaw.uptimeSeconds)}</Text>
          </Box>
        </Group>
      </Card>

      {/* Provider rows */}
      {providers.map((provider) => (
        <Card key={provider.id} withBorder radius="md" p="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <Dot color={providerDotColor(provider.status)} />
              <Text size="sm">{provider.name}</Text>
            </Group>
            <Text
              size="xs"
              ff="var(--font-mono)"
              c={provider.latencyMs > 1000 ? 'amber.7' : 'dimmed'}
            >
              {provider.latencyMs}ms
            </Text>
          </Group>
        </Card>
      ))}

      {/* Errors/warnings */}
      {recentErrors.slice(0, 2).map((err) => (
        <Card
          key={err.id}
          withBorder
          radius="md"
          p="sm"
          bg={err.level === 'error' ? 'red.0' : 'yellow.0'}
        >
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <AlertCircle
              size={14}
              color={err.level === 'error' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-yellow-7)'}
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <Box>
              <Text size="xs" c={err.level === 'error' ? 'red.7' : 'yellow.8'} lineClamp={2}>
                {err.message}
              </Text>
              <Text size="xs" c="dimmed" ff="var(--font-mono)" mt={2}>
                {formatRelative(err.occurredAt)}
              </Text>
            </Box>
          </Group>
        </Card>
      ))}
    </Stack>
  )
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

'use client'

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Server,
  Wifi,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BridgeResponse, OpenClawStatus, ProviderStatus, TaskRunStatus } from '@uss/shared'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${n}`
}

function statusColor(status: string): string {
  if (status === 'busy' || status === 'running') return 'amber'
  if (status === 'error' || status === 'failed' || status === 'down') return 'red'
  if (status === 'healthy' || status === 'completed') return 'green'
  return 'gray'
}

function openclawLabel(status: OpenClawStatus): string {
  if (status === 'running') return 'Running'
  if (status === 'stopped') return 'Stopped'
  return 'Error'
}

function taskStatusIcon(status: TaskRunStatus) {
  if (status === 'running') return <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
  if (status === 'completed') return <CheckCircle2 size={14} />
  if (status === 'failed') return <X size={14} />
  return <Clock size={14} />
}

function providerPercent(status: ProviderStatus): number {
  if (status === 'healthy') return 100
  if (status === 'degraded') return 55
  return 10
}

export function BridgeDashboard({ data }: { data: BridgeResponse }) {
  const router = useRouter()

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="lg">
        <Box>
          <Title order={1} ff="Space Grotesk, system-ui, sans-serif">
            Bridge
          </Title>
          <Text c="dimmed">Command center overview</Text>
        </Box>

        <Card withBorder radius="lg" p="md">
          <Group justify="space-between" mb="sm">
            <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="Space Grotesk, system-ui, sans-serif">
              Fleet Status
            </Text>
            <Button variant="subtle" size="compact-sm" rightSection={<ArrowRight size={12} />} onClick={() => router.push('/agents')}>
              View all
            </Button>
          </Group>
          <ScrollArea>
            <Group wrap="nowrap" align="stretch">
              {data.agents.map((agent) => (
                <Card
                  key={agent.id}
                  withBorder
                  miw={220}
                  radius="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push('/agents')}
                >
                  <Group justify="space-between" mb="xs">
                    <Avatar src={agent.avatarUrl ?? undefined} radius="xl" color="sky">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Badge color={statusColor(agent.status)} variant="light">
                      {agent.status}
                    </Badge>
                  </Group>
                  <Text fw={600}>{agent.name}</Text>
                  <Text size="sm" c="dimmed">{agent.role}</Text>
                  <Badge mt="sm" variant="outline" color="slate">
                    {agent.model}
                  </Badge>
                  {agent.currentTask && (
                    <Text mt="xs" size="xs" c="sky.7">↳ {agent.currentTask}</Text>
                  )}
                </Card>
              ))}
            </Group>
          </ScrollArea>
        </Card>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder radius="lg" p={0}>
              <Group justify="space-between" p="md">
                <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="Space Grotesk, system-ui, sans-serif">
                  Recent Tasks
                </Text>
                <Button variant="subtle" size="compact-sm" rightSection={<ArrowRight size={12} />} onClick={() => router.push('/tasks')}>
                  View all
                </Button>
              </Group>
              <Divider />
              <Stack gap={0}>
                {data.recentTaskRuns.slice(0, 8).map((run, idx) => (
                  <Box
                    key={run.id}
                    p="md"
                    style={{ cursor: 'pointer', borderBottom: idx === data.recentTaskRuns.slice(0, 8).length - 1 ? 'none' : '1px solid var(--mantine-color-gray-2)' }}
                    onClick={() => router.push('/tasks')}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group wrap="nowrap" gap="xs">
                        <ThemeIcon variant="light" color={statusColor(run.status)} size="sm">
                          {taskStatusIcon(run.status)}
                        </ThemeIcon>
                        <Box>
                          <Text size="sm" fw={500}>{run.taskName}</Text>
                          {run.error && <Text size="xs" c="red">{run.error}</Text>}
                        </Box>
                      </Group>
                      <Group gap="xs" wrap="nowrap">
                        <Badge variant="light" color="sky">{run.agentName}</Badge>
                        <Text size="xs" c="dimmed" ff="JetBrains Mono, monospace">{relativeTime(run.startedAt)}</Text>
                      </Group>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder radius="lg" p="md">
              <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="Space Grotesk, system-ui, sans-serif" mb="sm">
                System Health
              </Text>

              <Card withBorder radius="md" mb="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color={data.systemHealth.openclaw.status === 'running' ? 'green' : 'red'}>
                      <Server size={16} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed">OpenClaw</Text>
                      <Text fw={600}>{openclawLabel(data.systemHealth.openclaw.status)}</Text>
                    </Box>
                  </Group>
                  <Text size="xs" ff="JetBrains Mono, monospace">v{data.systemHealth.openclaw.version}</Text>
                </Group>
              </Card>

              <Stack gap="xs">
                {data.systemHealth.providers.map((provider) => (
                  <Card key={provider.id} withBorder radius="md" p="sm">
                    <Group justify="space-between" mb={6}>
                      <Group gap="xs">
                        <ThemeIcon variant="light" color={statusColor(provider.status)} size="sm">
                          <Wifi size={12} />
                        </ThemeIcon>
                        <Text size="sm">{provider.name}</Text>
                      </Group>
                      <Text size="xs" c="dimmed" ff="JetBrains Mono, monospace">{provider.latencyMs}ms</Text>
                    </Group>
                    <Progress value={providerPercent(provider.status)} color={statusColor(provider.status)} size="xs" />
                  </Card>
                ))}
              </Stack>

              {data.systemHealth.recentErrors.length > 0 && (
                <Stack mt="sm" gap="xs">
                  {data.systemHealth.recentErrors.slice(0, 2).map((err) => (
                    <Card key={err.id} withBorder radius="md" p="sm" bg={err.level === 'error' ? 'red.0' : 'amber.0'}>
                      <Group gap="xs" align="flex-start">
                        <AlertCircle size={14} color={err.level === 'error' ? '#ef4444' : '#d97706'} />
                        <Box>
                          <Text size="xs" c={err.level === 'error' ? 'red.7' : 'amber.8'}>{err.message}</Text>
                          <Text size="xs" c="dimmed" ff="JetBrains Mono, monospace">{relativeTime(err.occurredAt)}</Text>
                        </Box>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Card withBorder radius="lg" style={{ cursor: 'pointer' }} onClick={() => router.push('/usage')}>
            <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="Space Grotesk, system-ui, sans-serif">Today</Text>
            <Text ff="JetBrains Mono, monospace" fw={700} size="xl" mt="xs">${data.usageSnapshot.today.costUsd.toFixed(2)}</Text>
            <Group mt="sm" gap="xl">
              <Box>
                <Text size="xs" c="dimmed">Tokens</Text>
                <Text ff="JetBrains Mono, monospace">{formatTokens(data.usageSnapshot.today.tokens)}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Conversations</Text>
                <Text ff="JetBrains Mono, monospace">{data.usageSnapshot.today.conversations}</Text>
              </Box>
            </Group>
          </Card>

          <Card withBorder radius="lg" style={{ cursor: 'pointer' }} onClick={() => router.push('/usage')}>
            <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="Space Grotesk, system-ui, sans-serif">This Week</Text>
            <Text ff="JetBrains Mono, monospace" fw={700} size="xl" mt="xs">${data.usageSnapshot.thisWeek.costUsd.toFixed(2)}</Text>
            <Group mt="sm" gap="xl">
              <Box>
                <Text size="xs" c="dimmed">Tokens</Text>
                <Text ff="JetBrains Mono, monospace">{formatTokens(data.usageSnapshot.thisWeek.tokens)}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Conversations</Text>
                <Text ff="JetBrains Mono, monospace">{data.usageSnapshot.thisWeek.conversations}</Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>
      </Stack>
    </Box>
  )
}

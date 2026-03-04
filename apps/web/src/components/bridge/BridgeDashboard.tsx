'use client'

import { Box, Button, Card, Divider, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BridgeResponse } from '@uss/shared'
import { AgentCard } from './AgentCard'
import { TaskRunRow } from './TaskRunRow'
import { HealthPanel } from './HealthPanel'
import { UsageTile } from './UsageTile'

export function BridgeDashboard({ data }: { data: BridgeResponse }) {
  const router = useRouter()

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="lg">
        {/* Header */}
        <Box>
          <Title order={1} ff="var(--font-heading)">Bridge</Title>
          <Text c="dimmed">Command center overview</Text>
        </Box>

        {/* Fleet Status */}
        <Card withBorder radius="lg" p="md">
          <Group justify="space-between" mb="sm">
            <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="var(--font-heading)">
              Fleet Status
            </Text>
            <Button
              variant="subtle"
              size="compact-sm"
              rightSection={<ArrowRight size={12} />}
              onClick={() => router.push('/agents')}
            >
              View all
            </Button>
          </Group>

          {data.agents.length === 0 ? (
            <Box py="xl" style={{ textAlign: 'center' }}>
              <Text c="dimmed" size="sm">No agents connected</Text>
            </Box>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <Group wrap="nowrap" align="stretch" gap="sm">
                {data.agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onClick={() => router.push('/agents')}
                  />
                ))}
              </Group>
            </Box>
          )}
        </Card>

        <Grid>
          {/* Recent Tasks */}
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder radius="lg" p={0}>
              <Group justify="space-between" p="md">
                <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="var(--font-heading)">
                  Recent Tasks
                </Text>
                <Button
                  variant="subtle"
                  size="compact-sm"
                  rightSection={<ArrowRight size={12} />}
                  onClick={() => router.push('/tasks')}
                >
                  View all
                </Button>
              </Group>
              <Divider />

              {data.recentTaskRuns.length === 0 ? (
                <Box px="md" py="sm">
                  <Text size="sm" c="dimmed">No recent task runs</Text>
                </Box>
              ) : (
                <Stack gap={0}>
                  {data.recentTaskRuns.slice(0, 8).map((run, idx) => (
                    <TaskRunRow
                      key={run.id}
                      run={run}
                      isLast={idx === Math.min(data.recentTaskRuns.length, 8) - 1}
                      onClick={() => router.push('/tasks')}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>

          {/* System Health */}
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder radius="lg" p="md">
              <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="var(--font-heading)" mb="sm">
                System Health
              </Text>
              <HealthPanel health={data.systemHealth} />
            </Card>
          </Grid.Col>
        </Grid>

        {/* Usage */}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <UsageTile label="Today" period={data.usageSnapshot.today} onClick={() => router.push('/usage')} />
          <UsageTile label="This Week" period={data.usageSnapshot.thisWeek} onClick={() => router.push('/usage')} />
        </SimpleGrid>
      </Stack>
    </Box>
  )
}

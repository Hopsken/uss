'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import type { BridgeResponse } from '@uss/shared'
import { AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchBridgeData } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { Activity } from './Activity'
import type { ActivityEvent, EventStatus, EventType } from './types'

function mapTaskStatusToEventStatus(status: 'running' | 'completed' | 'failed' | 'scheduled'): EventStatus {
  if (status === 'running') return 'running'
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'failed'
  return 'info'
}

function inferOpenClawEventStatus(status: BridgeResponse['systemHealth']['openclaw']['status']): EventStatus {
  if (status === 'running') return 'success'
  if (status === 'error') return 'failed'
  return 'info'
}

function mapBridgeToActivityModel(data: BridgeResponse): { events: ActivityEvent[]; agents: { id: string; name: string }[] } {
  const events: ActivityEvent[] = []

  for (const run of data.recentTaskRuns) {
    events.push({
      id: `task-${run.id}`,
      agentId: run.agentId,
      agentName: run.agentName,
      eventType: 'task_run',
      description: run.error ? `${run.taskName} - ${run.error}` : run.taskName,
      status: mapTaskStatusToEventStatus(run.status),
      occurredAt: run.completedAt ?? run.startedAt,
    })
  }

  for (const err of data.systemHealth.recentErrors) {
    events.push({
      id: `system-error-${err.id}`,
      agentId: err.agentId ?? 'system',
      agentName: err.agentName ?? 'System',
      eventType: 'system',
      description: err.taskName ? `${err.taskName} - ${err.message}` : err.message,
      status: err.level === 'error' ? 'failed' : 'info',
      occurredAt: err.occurredAt,
    })
  }

  events.push({
    id: 'system-openclaw-status',
    agentId: 'system',
    agentName: 'System',
    eventType: 'system',
    description: `OpenClaw ${data.systemHealth.openclaw.status} (v${data.systemHealth.openclaw.version})`,
    status: inferOpenClawEventStatus(data.systemHealth.openclaw.status),
    occurredAt: new Date().toISOString(),
  })

  for (const provider of data.systemHealth.providers) {
    const status: EventStatus = provider.status === 'down' ? 'failed' : provider.status === 'degraded' ? 'info' : 'success'
    events.push({
      id: `system-provider-${provider.id}`,
      agentId: 'system',
      agentName: 'System',
      eventType: 'system',
      description: `Provider ${provider.name} is ${provider.status}`,
      status,
      occurredAt: new Date().toISOString(),
    })
  }

  return {
    events,
    agents: data.agents.map((agent) => ({ id: agent.id, name: agent.name })),
  }
}

export function ActivityClient() {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeEventType, setActiveEventType] = useState<EventType | null>(null)

  const activityQuery = useQuery({
    queryKey: queryKeys.activity.feed,
    queryFn: fetchBridgeData,
    staleTime: 30_000,
  })

  const mapped = useMemo(() => {
    if (!activityQuery.data) {
      return { events: [], agents: [] }
    }

    return mapBridgeToActivityModel(activityQuery.data)
  }, [activityQuery.data])

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box>
          <Title order={1} ff="var(--font-heading)">
            Activity
          </Title>
          <Text c="dimmed">Chronological fleet activity feed</Text>
        </Box>

        {activityQuery.isPending ? (
          <Center py="xl">
            <Loader color="sky" />
          </Center>
        ) : null}

        {activityQuery.error && !activityQuery.isPending ? (
          <Alert color="red" icon={<AlertCircle size={16} />} title="Unable to load activity">
            <Stack gap="xs">
              <Text size="sm">{activityQuery.error instanceof Error ? activityQuery.error.message : 'Unknown error'}</Text>
              <Button variant="light" size="xs" onClick={() => activityQuery.refetch()} loading={activityQuery.isFetching}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {!activityQuery.isPending && !activityQuery.error ? (
          <Box
            style={{
              minHeight: 0,
              flex: 1,
              border: '1px solid var(--mantine-color-slate-2)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--mantine-color-white)',
            }}
          >
            <Activity
              events={mapped.events}
              agents={mapped.agents}
              activeAgentId={activeAgentId}
              activeEventType={activeEventType}
              onFilterByAgent={setActiveAgentId}
              onFilterByType={setActiveEventType}
            />
          </Box>
        ) : null}
      </Stack>
    </Box>
  )
}

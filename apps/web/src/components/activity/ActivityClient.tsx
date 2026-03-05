'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { queryKeys } from '@/lib/query-keys'
import { activityHttpFeedAdapter } from './activity-feed'
import { mapBridgeToActivityModel } from './map-activity'
import { Activity } from './Activity'
import type { EventType } from './types'

export function ActivityClient() {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeEventType, setActiveEventType] = useState<EventType | null>(null)

  const activityQuery = useQuery({
    queryKey: queryKeys.activity.feed,
    queryFn: activityHttpFeedAdapter.getSnapshot,
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

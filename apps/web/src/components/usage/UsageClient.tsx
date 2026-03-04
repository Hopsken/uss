'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { UsageQuery } from '@uss/shared'
import { Usage } from './Usage'
import { fetchUsage } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

const RANGE_OPTIONS = [
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'all_time', label: 'All time' },
]

function formatIsoDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfWeekMonday(now: Date): Date {
  const d = new Date(now)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + diff)
  return d
}

function resolveRangeQuery(range: string): UsageQuery {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (range === 'this_week') {
    return {
      startDate: formatIsoDateLocal(startOfWeekMonday(today)),
      endDate: formatIsoDateLocal(today),
      mode: 'gateway',
    }
  }

  if (range === 'this_month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      startDate: formatIsoDateLocal(monthStart),
      endDate: formatIsoDateLocal(today),
      mode: 'gateway',
    }
  }

  if (range === 'last_month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)

    return {
      startDate: formatIsoDateLocal(start),
      endDate: formatIsoDateLocal(end),
      mode: 'gateway',
    }
  }

  return {
    startDate: '1970-01-01',
    endDate: formatIsoDateLocal(today),
    mode: 'gateway',
  }
}

export function UsageClient() {
  const [activeRange, setActiveRange] = useState<string>('this_week')

  const rangeQuery = useMemo(() => resolveRangeQuery(activeRange), [activeRange])

  const usageQuery = useQuery({
    queryKey: queryKeys.usage.dashboard(rangeQuery),
    queryFn: () => fetchUsage(rangeQuery),
    placeholderData: (previousData) => previousData,
  })

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1280} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box>
          <Title order={1} ff="var(--font-heading)">
            Usage
          </Title>
          <Text c="dimmed">Token consumption and cost across the fleet</Text>
        </Box>

        {usageQuery.isPending && !usageQuery.data ? (
          <Center py="xl">
            <Loader color="sky" />
          </Center>
        ) : null}

        {usageQuery.error && !usageQuery.data ? (
          <Alert color="red" title="Unable to load usage">
            <Stack gap="xs">
              <Text size="sm">{usageQuery.error instanceof Error ? usageQuery.error.message : 'Unknown error'}</Text>
              <Button variant="light" size="xs" onClick={() => usageQuery.refetch()} loading={usageQuery.isFetching}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {usageQuery.data ? (
          <Usage
            summary={usageQuery.data.summary}
            timeSeries={usageQuery.data.timeSeries}
            agents={usageQuery.data.agents}
            modelBreakdown={usageQuery.data.modelBreakdown}
            activeTimeRange={activeRange}
            timeRangeOptions={RANGE_OPTIONS}
            onTimeRangeChange={setActiveRange}
          />
        ) : null}
      </Stack>
    </Box>
  )
}

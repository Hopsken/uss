'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { UsageQuery } from '@uss/shared'
import { Usage } from './Usage'
import { DEFAULT_USAGE_RANGE, RANGE_OPTIONS, resolveRangeQuery } from './range'
import { fetchUsage } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

interface UsageClientProps {
  initialRange?: string
  initialRangeQuery?: UsageQuery
}

export function UsageClient({ initialRange, initialRangeQuery }: UsageClientProps) {
  const resolvedInitialRange = initialRange ?? DEFAULT_USAGE_RANGE
  const [activeRange, setActiveRange] = useState<string>(resolvedInitialRange)

  const rangeQuery = useMemo(() => {
    if (initialRangeQuery && activeRange === resolvedInitialRange) {
      return initialRangeQuery
    }

    return resolveRangeQuery(activeRange, new Date())
  }, [activeRange, initialRangeQuery, resolvedInitialRange])

  const usageQuery = useQuery({
    queryKey: queryKeys.usage.dashboard(rangeQuery),
    queryFn: () => fetchUsage(rangeQuery),
    placeholderData: (previousData) => previousData,
  })

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto" h="100%">
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

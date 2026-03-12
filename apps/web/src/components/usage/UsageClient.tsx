'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { PageContainer, PageHeader, ErrorState, LoadingState } from '@/components/app/page-shell'
import { fetchUsage } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { Usage } from './Usage'
import { DEFAULT_USAGE_RANGE, RANGE_OPTIONS, resolveRangeQuery } from './range'

interface UsageClientProps {
  initialRange?: string
}

export function UsageClient({ initialRange }: UsageClientProps) {
  const resolvedInitialRange = initialRange ?? DEFAULT_USAGE_RANGE
  const [activeRange, setActiveRange] = useState<string>(resolvedInitialRange)
  const rangeQuery = useMemo(() => resolveRangeQuery(activeRange, new Date()), [activeRange])

  const usageQuery = useQuery({
    queryKey: queryKeys.usage.dashboard(rangeQuery),
    queryFn: () => fetchUsage(rangeQuery),
    placeholderData: (previousData) => previousData,
  })

  return (
    <PageContainer>
      <PageHeader eyebrow="Fleet spend" title="Usage" description="Token consumption and cost across the fleet." />

      {usageQuery.isPending && !usageQuery.data ? <LoadingState label="Loading usage" /> : null}

      {usageQuery.error && !usageQuery.data ? (
        <ErrorState
          title="Unable to load usage"
          message={usageQuery.error instanceof Error ? usageQuery.error.message : 'Unknown error'}
          onRetry={() => usageQuery.refetch()}
        />
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
    </PageContainer>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { PageContainer, PageHeader, ErrorState, LoadingState, SectionCard } from '@/components/app/page-shell'
import { queryKeys } from '@/lib/query-keys'
import { Activity } from './Activity'
import { activityHttpFeedAdapter } from './activity-feed'
import { mapBridgeToActivityModel } from './map-activity'
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
    if (!activityQuery.data) return { events: [], agents: [] }
    return mapBridgeToActivityModel(activityQuery.data)
  }, [activityQuery.data])

  return (
    <PageContainer>
      <PageHeader eyebrow="Timeline" title="Activity" description="Chronological fleet activity feed." />

      {activityQuery.isPending ? <LoadingState label="Loading activity" /> : null}

      {activityQuery.error && !activityQuery.isPending ? (
        <ErrorState
          title="Unable to load activity"
          message={activityQuery.error instanceof Error ? activityQuery.error.message : 'Unknown error'}
          onRetry={() => activityQuery.refetch()}
        />
      ) : null}

      {!activityQuery.isPending && !activityQuery.error ? (
        <SectionCard className="min-h-0 flex-1 overflow-hidden p-0">
          <Activity
            events={mapped.events}
            agents={mapped.agents}
            activeAgentId={activeAgentId}
            activeEventType={activeEventType}
            onFilterByAgent={setActiveAgentId}
            onFilterByType={setActiveEventType}
          />
        </SectionCard>
      ) : null}
    </PageContainer>
  )
}

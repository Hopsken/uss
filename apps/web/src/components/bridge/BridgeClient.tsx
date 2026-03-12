'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchBridgeData } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { BridgeDashboard } from './BridgeDashboard'
import { ErrorState, LoadingState, PageContainer } from '@/components/app/page-shell'

export function BridgeClient() {
  const bridgeQuery = useQuery({
    queryKey: queryKeys.bridge.dashboard,
    queryFn: fetchBridgeData,
  })

  if (bridgeQuery.isPending && !bridgeQuery.data) {
    return (
      <PageContainer>
        <LoadingState label="Loading bridge overview" />
      </PageContainer>
    )
  }

  if (bridgeQuery.error && !bridgeQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load bridge data"
          message={bridgeQuery.error instanceof Error ? bridgeQuery.error.message : 'Unknown error'}
          onRetry={() => bridgeQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return bridgeQuery.data ? <BridgeDashboard data={bridgeQuery.data} /> : null
}

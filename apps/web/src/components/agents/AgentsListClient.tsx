'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { LoadingState, PageContainer } from '@/components/app/page-shell'
import { AgentsList } from '@/components/agents/AgentsList'
import { fetchAgentsList } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

export function AgentsListClient() {
  const router = useRouter()
  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list,
    queryFn: fetchAgentsList,
  })

  if (agentsQuery.isPending && !agentsQuery.data) {
    return (
      <PageContainer>
        <LoadingState label="Loading agents" />
      </PageContainer>
    )
  }

  return (
    <AgentsList
      agents={agentsQuery.data?.agents ?? []}
      isSyncing={agentsQuery.isFetching}
      onSelectAgent={(agentId) => router.push(`/agents/${encodeURIComponent(agentId)}`)}
      onSync={() => {
        void agentsQuery.refetch()
      }}
      error={agentsQuery.error instanceof Error ? agentsQuery.error.message : null}
    />
  )
}

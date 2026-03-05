'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AgentsList } from '@/components/agents/AgentsList'
import { fetchAgentsList } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

export function AgentsListClient() {
  const router = useRouter()
  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list,
    queryFn: fetchAgentsList,
  })

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

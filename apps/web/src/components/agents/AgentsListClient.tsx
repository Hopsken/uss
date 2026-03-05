'use client'

import { useTransition } from 'react'
import type { AgentsListResponse } from '@uss/shared'
import { useRouter } from 'next/navigation'
import { AgentsList } from '@/components/agents/AgentsList'
import { useRefreshOnFocus } from '@/lib/use-refresh-on-focus'

export function AgentsListClient({ initialData }: { initialData: AgentsListResponse }) {
  const router = useRouter()
  const [isRefreshing, startRefreshTransition] = useTransition()
  useRefreshOnFocus()

  return (
    <AgentsList
      agents={initialData.agents}
      isSyncing={isRefreshing}
      onSelectAgent={(agentId) => router.push(`/agents/${encodeURIComponent(agentId)}`)}
      onSync={() => {
        startRefreshTransition(() => {
          router.refresh()
        })
      }}
    />
  )
}

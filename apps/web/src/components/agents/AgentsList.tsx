'use client'

import { RefreshCw } from 'lucide-react'
import type { AgentListItem } from '@uss/shared'
import { Button } from '@/components/ui/button'
import { AgentCard } from './AgentCard'
import { EmptyState, ErrorState, PageContainer, PageHeader } from '@/components/app/page-shell'

export function AgentsList({
  agents,
  isSyncing,
  onSelectAgent,
  onSync,
  error,
}: {
  agents: AgentListItem[]
  isSyncing?: boolean
  onSelectAgent?: (agentId: string) => void
  onSync?: () => void
  error?: string | null
}) {
  const busyCount = agents.filter((agent) => agent.status === 'busy').length
  const errorCount = agents.filter((agent) => agent.status === 'error').length

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Crew"
        title="Agents"
        description={`${agents.length} ${agents.length === 1 ? 'agent' : 'agents'} online${busyCount ? ` • ${busyCount} busy` : ''}${errorCount ? ` • ${errorCount} error` : ''}.`}
        actions={
          <Button onClick={onSync} disabled={isSyncing}>
            <RefreshCw data-icon="inline-start" className={isSyncing ? 'uss-status-busy' : undefined} />
            Sync from OpenClaw
          </Button>
        }
      />

      {error ? <ErrorState title="Unable to load agents" message={error} onRetry={onSync} /> : null}

      {agents.length === 0 ? (
        <EmptyState
          title="No agents found"
          description="Sync from OpenClaw to load your active crew into the command center."
          action={
            <Button onClick={onSync} disabled={isSyncing}>
              Sync from OpenClaw
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onClick={() => onSelectAgent?.(agent.id)} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

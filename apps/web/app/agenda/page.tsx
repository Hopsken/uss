import { AgendaClient } from '@/components/tasks/AgendaClient'

type PageProps = {
  searchParams?: Promise<{
    agentId?: string | string[]
  }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const agentIdRaw = resolvedSearchParams.agentId
  const initialAgentFilter = typeof agentIdRaw === 'string' ? agentIdRaw : null

  return <AgendaClient initialAgentFilter={initialAgentFilter} />
}

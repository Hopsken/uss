import { AutomationClient } from '@/components/tasks/AutomationClient'

type PageProps = {
  searchParams?: Promise<{
    agentId?: string | string[]
  }>
}

export default async function AutomationPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const agentIdRaw = resolvedSearchParams.agentId
  const initialAgentFilter = typeof agentIdRaw === 'string' ? agentIdRaw : null

  return <AutomationClient initialAgentFilter={initialAgentFilter} />
}

import { TasksClient } from '@/components/tasks/TasksClient'

type PageProps = {
  searchParams?: Promise<{
    agentId?: string | string[]
  }>
}

export default async function TasksPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const agentIdRaw = resolvedSearchParams.agentId
  const initialAgentFilter = typeof agentIdRaw === 'string' ? agentIdRaw : null

  return <TasksClient initialAgentFilter={initialAgentFilter} />
}

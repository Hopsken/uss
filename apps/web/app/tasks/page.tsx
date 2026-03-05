import { Alert, Box } from '@mantine/core'
import { TasksClient } from '@/components/tasks/TasksClient'
import { fetchTasksDashboardServer } from '@/lib/api-server'

type PageProps = {
  searchParams?: Promise<{
    agentId?: string | string[]
  }>
}

export default async function TasksPage({ searchParams }: PageProps) {
  try {
    const resolvedSearchParams = (await searchParams) ?? {}
    const agentIdRaw = resolvedSearchParams.agentId
    const initialAgentFilter = typeof agentIdRaw === 'string' ? agentIdRaw : null
    const initialData = await fetchTasksDashboardServer(initialAgentFilter ?? undefined)

    return <TasksClient initialData={initialData} initialAgentFilter={initialAgentFilter} />
  } catch (error) {
    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load tasks">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }
}

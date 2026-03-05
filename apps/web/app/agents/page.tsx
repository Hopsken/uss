import { Alert, Box } from '@mantine/core'
import { AgentsListClient } from '@/components/agents/AgentsListClient'
import { fetchAgentsListServer } from '@/lib/api-server'

export default async function AgentsPage() {
  try {
    const initialData = await fetchAgentsListServer()

    return (
      <AgentsListClient initialData={initialData} />
    )
  } catch (error) {
    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load agents">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }
}

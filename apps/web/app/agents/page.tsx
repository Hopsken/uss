import { Alert, Box } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { AgentsListClient } from '@/components/agents/AgentsListClient'
import { fetchAgentsList } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { getQueryClient } from '@/lib/react-query'

export default async function AgentsPage() {
  try {
    const queryClient = getQueryClient()

    await queryClient.prefetchQuery({
      queryKey: queryKeys.agents.list,
      queryFn: fetchAgentsList,
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AgentsListClient />
      </HydrationBoundary>
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

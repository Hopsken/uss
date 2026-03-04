import { Alert, Box } from '@mantine/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { AgentDetailClient } from '@/components/agents/AgentDetailClient'
import { fetchAgentDetailServer } from '@/lib/api-server'
import { queryKeys } from '@/lib/query-keys'
import { getQueryClient } from '@/lib/react-query'

type PageProps = {
  params: Promise<{
    agentId: string
  }>
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { agentId } = await params

  try {
    const queryClient = getQueryClient()
    await queryClient.prefetchQuery({
      queryKey: queryKeys.agents.detail(agentId),
      queryFn: () => fetchAgentDetailServer(agentId),
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AgentDetailClient agentId={agentId} />
      </HydrationBoundary>
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'not_found') {
      notFound()
    }

    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load agent details">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }
}

import { Alert, Box } from '@mantine/core'
import { notFound } from 'next/navigation'
import { AgentDetailClient } from '@/components/agents/AgentDetailClient'
import { fetchAgentDetailServer } from '@/lib/api-server'

type PageProps = {
  params: Promise<{
    agentId: string
  }>
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { agentId } = await params

  try {
    const initialDetail = await fetchAgentDetailServer(agentId)

    return (
      <AgentDetailClient agentId={agentId} initialDetail={initialDetail} />
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

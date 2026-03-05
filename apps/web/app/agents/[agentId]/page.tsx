import { AgentDetailClient } from '@/components/agents/AgentDetailClient'

type PageProps = {
  params: Promise<{
    agentId: string
  }>
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { agentId } = await params
  return <AgentDetailClient agentId={agentId} />
}

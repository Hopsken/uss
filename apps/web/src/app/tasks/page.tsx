import { redirect } from 'next/navigation'

type PageProps = {
  searchParams?: Promise<{
    agentId?: string | string[]
  }>
}

export default async function TasksPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const agentIdRaw = resolvedSearchParams.agentId
  const initialAgentFilter = typeof agentIdRaw === 'string' ? agentIdRaw : null

  if (initialAgentFilter) {
    redirect(`/automation?agentId=${encodeURIComponent(initialAgentFilter)}`)
  }

  redirect('/automation')
}

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Box, Loader, Stack, Text } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { AgentsList } from '@/components/agents/AgentsList'
import { fetchAgentsList } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

export function AgentsListClient() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list,
    queryFn: fetchAgentsList,
  })

  if (agentsQuery.isLoading && !agentsQuery.data) {
    return (
      <Box p="xl" ta="center">
        <Stack align="center" gap="xs">
          <Loader />
          <Text size="sm" c="dimmed">
            Loading agents...
          </Text>
        </Stack>
      </Box>
    )
  }

  if (agentsQuery.error && !agentsQuery.data) {
    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load agents">
          {agentsQuery.error instanceof Error ? agentsQuery.error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }

  const payload = agentsQuery.data
  if (!payload) {
    return null
  }

  return (
    <AgentsList
      agents={payload.agents}
      isSyncing={agentsQuery.isFetching}
      error={agentsQuery.error instanceof Error ? agentsQuery.error.message : null}
      onSelectAgent={(agentId) => router.push(`/agents/${encodeURIComponent(agentId)}`)}
      onSync={async () => {
        await agentsQuery.refetch()
        await queryClient.invalidateQueries({ queryKey: ['agents', 'detail'] })
      }}
    />
  )
}

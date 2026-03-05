'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AgentDetailResponse, UpdateAgentModelRequest } from '@uss/shared'
import { useRouter } from 'next/navigation'
import { AgentDetail } from '@/components/agents/AgentDetail'
import { fetchAgentDetail, updateAgentModel } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

export function AgentDetailClient({ agentId }: { agentId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const detailQuery = useQuery({
    queryKey: queryKeys.agents.detail(agentId),
    queryFn: () => fetchAgentDetail(agentId),
  })

  const updateModelMutation = useMutation({
    mutationFn: (body: UpdateAgentModelRequest) => updateAgentModel(agentId, body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.detail(agentId) })
      const previous = queryClient.getQueryData<AgentDetailResponse>(queryKeys.agents.detail(agentId))

      queryClient.setQueryData<AgentDetailResponse>(queryKeys.agents.detail(agentId), (current) => {
        if (!current) {
          return current
        }

        const pickedModel = current.availableModels.find((model) => model.id === body.modelId)

        return {
          ...current,
          agent: {
            ...current.agent,
            model: {
              id: body.modelId,
              name: pickedModel?.name ?? body.modelId,
            },
          },
        }
      })

      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.agents.detail(agentId), context.previous)
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agentId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.agents.list }),
      ])
    },
  })

  if (detailQuery.isPending && !detailQuery.data) {
    return (
      <Center py="xl">
        <Loader color="sky" />
      </Center>
    )
  }

  if (detailQuery.error && !detailQuery.data) {
    const message = detailQuery.error instanceof Error ? detailQuery.error.message : 'Unknown error'

    if (message === 'not_found') {
      return (
        <Box p="xl" maw={700} mx="auto">
          <Alert color="gray" title="Agent not found">
            <Stack gap="xs">
              <Text size="sm">Agent {agentId} does not exist or is no longer available.</Text>
              <Button variant="light" size="xs" w="fit-content" onClick={() => router.push('/agents')}>
                Back to agents
              </Button>
            </Stack>
          </Alert>
        </Box>
      )
    }

    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load agent details">
          <Stack gap="xs">
            <Text size="sm">{message}</Text>
            <Button variant="light" size="xs" w="fit-content" onClick={() => detailQuery.refetch()} loading={detailQuery.isFetching}>
              Retry
            </Button>
          </Stack>
        </Alert>
      </Box>
    )
  }

  if (!detailQuery.data) {
    return null
  }

  return (
    <AgentDetail
      agent={detailQuery.data.agent}
      availableModels={detailQuery.data.availableModels}
      isMutatingModel={updateModelMutation.isPending || detailQuery.isFetching}
      onBack={() => router.push('/agents')}
      onViewTasks={(id) => router.push(`/tasks?agentId=${encodeURIComponent(id)}`)}
      onChangeModel={(id, modelId) => {
        if (id !== agentId) {
          return
        }

        updateModelMutation.mutate({ modelId })
      }}
    />
  )
}

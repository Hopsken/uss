'use client'

import { Alert, Box, Loader, Stack, Text } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AgentDetailResponse,
  AgentListItem,
  AgentsListResponse,
  UpdateAgentModelRequest,
} from '@uss/shared'
import { useRouter } from 'next/navigation'
import { AgentDetail } from '@/components/agents/AgentDetail'
import { fetchAgentDetail, updateAgentModel } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

export function AgentDetailClient({
  agentId,
}: {
  agentId: string
}) {
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
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.list })

      const previousDetail = queryClient.getQueryData<AgentDetailResponse>(queryKeys.agents.detail(agentId))
      const previousList = queryClient.getQueryData<AgentsListResponse>(queryKeys.agents.list)

      queryClient.setQueryData<AgentDetailResponse>(queryKeys.agents.detail(agentId), (prev) => {
        if (!prev) return prev

        const pickedModel = prev.availableModels.find((model) => model.id === body.modelId)
        return {
          ...prev,
          agent: {
            ...prev.agent,
            model: {
              id: body.modelId,
              name: pickedModel?.name ?? body.modelId,
            },
          },
        }
      })

      queryClient.setQueryData<AgentsListResponse>(queryKeys.agents.list, (prev) => {
        if (!prev) return prev

        return {
          ...prev,
          agents: prev.agents.map((agent): AgentListItem => {
            if (agent.id !== agentId) return agent
            const pickedModel = prev.availableModels.find((model) => model.id === body.modelId)
            return {
              ...agent,
              model: {
                id: body.modelId,
                name: pickedModel?.name ?? body.modelId,
              },
            }
          }),
        }
      })

      return {
        previousDetail,
        previousList,
      }
    },
    onError: (_error, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.agents.detail(agentId), context.previousDetail)
      }
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.agents.list, context.previousList)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.agents.list })
    },
  })

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <Box p="xl" ta="center">
        <Stack align="center" gap="xs">
          <Loader />
          <Text size="sm" c="dimmed">
            Loading agent...
          </Text>
        </Stack>
      </Box>
    )
  }

  if (detailQuery.error && !detailQuery.data) {
    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load agent details">
          {detailQuery.error instanceof Error ? detailQuery.error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }

  const payload = detailQuery.data
  if (!payload) {
    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Agent not found">
          Could not find an agent with id "{agentId}".
        </Alert>
      </Box>
    )
  }

  return (
    <AgentDetail
      agent={payload.agent}
      availableModels={payload.availableModels}
      isMutatingModel={updateModelMutation.isPending}
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

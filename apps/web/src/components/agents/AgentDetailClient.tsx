'use client'

import { useEffect, useState, useTransition } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { AgentDetailResponse, UpdateAgentModelRequest } from '@uss/shared'
import { useRouter } from 'next/navigation'
import { AgentDetail } from '@/components/agents/AgentDetail'
import { updateAgentModel } from '@/lib/api'
import { useRefreshOnFocus } from '@/lib/use-refresh-on-focus'

export function AgentDetailClient({
  agentId,
  initialDetail,
}: {
  agentId: string
  initialDetail: AgentDetailResponse
}) {
  const router = useRouter()
  const [detail, setDetail] = useState<AgentDetailResponse>(initialDetail)
  const [isRefreshing, startRefreshTransition] = useTransition()
  useRefreshOnFocus()

  useEffect(() => {
    setDetail(initialDetail)
  }, [initialDetail])

  const updateModelMutation = useMutation({
    mutationFn: (body: UpdateAgentModelRequest) => updateAgentModel(agentId, body),
    onMutate: (body) => {
      let previous: AgentDetailResponse | undefined

      setDetail((current) => {
        previous = current
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
        setDetail(context.previous)
      }
    },
    onSettled: () => {
      startRefreshTransition(() => {
        router.refresh()
      })
    },
  })

  return (
    <AgentDetail
      agent={detail.agent}
      availableModels={detail.availableModels}
      isMutatingModel={updateModelMutation.isPending || isRefreshing}
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

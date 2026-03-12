'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SkillConfig, SkillsResponse } from '@uss/shared'
import { useEffect, useState } from 'react'
import { ErrorState, PageContainer, PageHeader, SectionCard, LoadingState } from '@/components/app/page-shell'
import { Skills } from './Skills'
import { assignSkill, fetchSkills, saveSkillConfig, toggleSkill } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

function updateSkillInPayload(
  prev: SkillsResponse | undefined,
  skillId: string,
  agentId: string | null,
  updater: (enabled: boolean) => boolean,
): SkillsResponse | undefined {
  if (!prev) return prev

  if (agentId === null) {
    return {
      ...prev,
      systemSkills: prev.systemSkills.map((skill) =>
        skill.id === skillId ? { ...skill, isEnabled: updater(skill.isEnabled) } : skill,
      ),
    }
  }

  return {
    ...prev,
    agentGroups: prev.agentGroups.map((group) =>
      group.agentId === agentId
        ? {
            ...group,
            skills: group.skills.map((skill) =>
              skill.id === skillId ? { ...skill, isEnabled: updater(skill.isEnabled) } : skill,
            ),
          }
        : group,
    ),
  }
}

function hasSelectedSkill(payload: SkillsResponse, skillId: string | null, agentId: string | null): boolean {
  if (!skillId) return false
  if (agentId === null) return payload.systemSkills.some((skill) => skill.id === skillId)
  return payload.agentGroups.find((group) => group.agentId === agentId)?.skills.some((skill) => skill.id === skillId) ?? false
}

export function SkillsClient() {
  const queryClient = useQueryClient()
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const skillsQuery = useQuery({
    queryKey: queryKeys.skills.list,
    queryFn: fetchSkills,
  })

  useEffect(() => {
    if (!selectedSkillId || !skillsQuery.data) return
    if (!hasSelectedSkill(skillsQuery.data, selectedSkillId, selectedAgentId)) {
      setSelectedSkillId(null)
      setSelectedAgentId(null)
    }
  }, [selectedAgentId, selectedSkillId, skillsQuery.data])

  const invalidateSkillsData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.list }),
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list }),
    ])
  }

  const toggleMutation = useMutation({
    mutationFn: (params: { skillId: string; agentId: string | null; enabled: boolean }) =>
      toggleSkill(params.skillId, { agentId: params.agentId, enabled: params.enabled }),
    onMutate: async (params) => {
      setMutationError(null)
      await queryClient.cancelQueries({ queryKey: queryKeys.skills.list })
      const previous = queryClient.getQueryData<SkillsResponse>(queryKeys.skills.list)
      queryClient.setQueryData<SkillsResponse>(queryKeys.skills.list, (prev) =>
        updateSkillInPayload(prev, params.skillId, params.agentId, () => params.enabled),
      )
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.skills.list, context.previous)
      setMutationError(error instanceof Error ? error.message : 'Failed to toggle skill')
    },
    onSettled: invalidateSkillsData,
  })

  const saveConfigMutation = useMutation({
    mutationFn: (params: { skillId: string; agentId: string | null; config: SkillConfig[] }) =>
      saveSkillConfig(params.skillId, { agentId: params.agentId, config: params.config }),
    onMutate: () => setMutationError(null),
    onError: (error) => setMutationError(error instanceof Error ? error.message : 'Failed to save skill config'),
    onSettled: invalidateSkillsData,
  })

  const assignMutation = useMutation({
    mutationFn: (params: { skillId: string; sourceAgentId: string | null; targetAgentId: string }) =>
      assignSkill(params.skillId, { sourceAgentId: params.sourceAgentId, targetAgentId: params.targetAgentId }),
    onMutate: () => setMutationError(null),
    onError: (error) => setMutationError(error instanceof Error ? error.message : 'Failed to assign skill'),
    onSettled: invalidateSkillsData,
  })

  const skillsData = skillsQuery.data

  return (
    <PageContainer size="wide">
      <PageHeader eyebrow="Registry" title="Skills" description="Browse, configure, and assign OpenClaw skills." />

      {skillsQuery.isPending && !skillsData ? <LoadingState label="Loading skills" /> : null}

      {skillsQuery.error && !skillsData ? (
        <ErrorState
          title="Unable to load skills"
          message={skillsQuery.error instanceof Error ? skillsQuery.error.message : 'Unknown error'}
          onRetry={() => skillsQuery.refetch()}
        />
      ) : null}

      {mutationError ? <ErrorState title="Skill update failed" message={mutationError} /> : null}

      {skillsData ? (
        <SectionCard className="min-h-0 flex-1 overflow-hidden p-0">
          <div
            className="min-h-0 flex-1 overflow-hidden"
            style={{
              opacity:
                toggleMutation.isPending || saveConfigMutation.isPending || assignMutation.isPending || skillsQuery.isFetching
                  ? 0.85
                  : 1,
            }}
          >
            <Skills
              systemSkills={skillsData.systemSkills}
              agentGroups={skillsData.agentGroups}
              selectedSkillId={selectedSkillId}
              selectedAgentId={selectedAgentId}
              onSelectSkill={(skillId, agentId) => {
                if (selectedSkillId === skillId && selectedAgentId === agentId) {
                  setSelectedSkillId(null)
                  setSelectedAgentId(null)
                  return
                }

                setSelectedSkillId(skillId)
                setSelectedAgentId(agentId)
              }}
              onClosePanel={() => {
                setSelectedSkillId(null)
                setSelectedAgentId(null)
              }}
              onToggleSkill={(skillId, agentId, enabled) => {
                toggleMutation.mutate({ skillId, agentId, enabled })
              }}
              onSaveConfig={(skillId, agentId, config) => {
                saveConfigMutation.mutate({ skillId, agentId, config })
              }}
              onAssignSkill={(skillId, targetAgentId) => {
                assignMutation.mutate({ skillId, sourceAgentId: selectedAgentId, targetAgentId })
              }}
            />
          </div>
        </SectionCard>
      ) : null}
    </PageContainer>
  )
}

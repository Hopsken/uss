'use client'

import { Alert, Box, Stack, Text, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import type { SkillsResponse, SkillConfig } from '@uss/shared'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Skills } from './Skills'
import { assignSkill, saveSkillConfig, toggleSkill } from '@/lib/api'
import { useRefreshOnFocus } from '@/lib/use-refresh-on-focus'

function updateSkillInPayload(
  prev: SkillsResponse | undefined,
  skillId: string,
  agentId: string | null,
  updater: (enabled: boolean) => boolean,
): SkillsResponse | undefined {
  if (!prev) {
    return prev
  }

  if (agentId === null) {
    return {
      ...prev,
      systemSkills: prev.systemSkills.map((skill) =>
        skill.id === skillId
          ? {
              ...skill,
              isEnabled: updater(skill.isEnabled),
            }
          : skill,
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
              skill.id === skillId
                ? {
                    ...skill,
                    isEnabled: updater(skill.isEnabled),
                  }
                : skill,
            ),
          }
        : group,
    ),
  }
}

function hasSelectedSkill(payload: SkillsResponse, skillId: string | null, agentId: string | null): boolean {
  if (!skillId) {
    return false
  }

  if (agentId === null) {
    return payload.systemSkills.some((skill) => skill.id === skillId)
  }

  return payload.agentGroups.find((group) => group.agentId === agentId)?.skills.some((skill) => skill.id === skillId) ?? false
}

export function SkillsClient({ initialData }: { initialData: SkillsResponse }) {
  const router = useRouter()
  const [skillsData, setSkillsData] = useState<SkillsResponse>(initialData)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [isRefreshing, startRefreshTransition] = useTransition()

  useRefreshOnFocus()

  useEffect(() => {
    setSkillsData(initialData)
  }, [initialData])

  useEffect(() => {
    if (!selectedSkillId) {
      return
    }

    if (!hasSelectedSkill(skillsData, selectedSkillId, selectedAgentId)) {
      setSelectedSkillId(null)
      setSelectedAgentId(null)
    }
  }, [skillsData, selectedAgentId, selectedSkillId])

  const refreshData = () => {
    startRefreshTransition(() => {
      router.refresh()
    })
  }

  const toggleMutation = useMutation({
    mutationFn: (params: { skillId: string; agentId: string | null; enabled: boolean }) =>
      toggleSkill(params.skillId, {
        agentId: params.agentId,
        enabled: params.enabled,
      }),
    onMutate: (params) => {
      setMutationError(null)
      let previous: SkillsResponse | undefined

      setSkillsData((prev) => {
        previous = prev
        return updateSkillInPayload(prev, params.skillId, params.agentId, () => params.enabled) ?? prev
      })

      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        setSkillsData(context.previous)
      }
      setMutationError(error instanceof Error ? error.message : 'Failed to toggle skill')
    },
    onSettled: refreshData,
  })

  const saveConfigMutation = useMutation({
    mutationFn: (params: { skillId: string; agentId: string | null; config: SkillConfig[] }) =>
      saveSkillConfig(params.skillId, {
        agentId: params.agentId,
        config: params.config,
      }),
    onMutate: () => {
      setMutationError(null)
    },
    onError: (error) => {
      setMutationError(error instanceof Error ? error.message : 'Failed to save skill config')
    },
    onSettled: refreshData,
  })

  const assignMutation = useMutation({
    mutationFn: (params: { skillId: string; sourceAgentId: string | null; targetAgentId: string }) =>
      assignSkill(params.skillId, {
        sourceAgentId: params.sourceAgentId,
        targetAgentId: params.targetAgentId,
      }),
    onMutate: () => {
      setMutationError(null)
    },
    onError: (error) => {
      setMutationError(error instanceof Error ? error.message : 'Failed to assign skill')
    },
    onSettled: refreshData,
  })

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1280} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box>
          <Title order={1} ff="var(--font-heading)">
            Skills
          </Title>
          <Text c="dimmed">Browse, configure, and assign OpenClaw skills</Text>
        </Box>

        {mutationError ? (
          <Alert color="red" title="Skill update failed" withCloseButton onClose={() => setMutationError(null)}>
            {mutationError}
          </Alert>
        ) : null}

        <Box
          style={{
            minHeight: 0,
            flex: 1,
            border: '1px solid var(--mantine-color-slate-2)',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'var(--mantine-color-white)',
            opacity:
              toggleMutation.isPending || saveConfigMutation.isPending || assignMutation.isPending || isRefreshing
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
              toggleMutation.mutate({
                skillId,
                agentId,
                enabled,
              })
            }}
            onSaveConfig={(skillId, agentId, config) => {
              saveConfigMutation.mutate({
                skillId,
                agentId,
                config,
              })
            }}
            onAssignSkill={(skillId, targetAgentId) => {
              assignMutation.mutate({
                skillId,
                sourceAgentId: selectedAgentId,
                targetAgentId,
              })
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}

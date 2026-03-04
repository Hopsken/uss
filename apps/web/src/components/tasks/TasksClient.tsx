'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KanbanView, TaskStatus } from '@uss/shared'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Tasks } from './Tasks'
import {
  changeTaskStatus,
  createTask,
  createTaskTemplate,
  deleteTask,
  deleteTaskTemplate,
  fetchTasksDashboard,
  reassignTask,
  runTaskNow,
  updateTask,
  updateTaskTemplate,
} from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

const STORAGE_KEY = 'uss.tasks.kanbanView'

function readStoredView(): KanbanView {
  if (typeof window === 'undefined') return 'by_agent'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === 'by_status' ? 'by_status' : 'by_agent'
}

export function TasksClient() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const agentIdFilter = searchParams.get('agentId') ?? undefined

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [kanbanView, setKanbanView] = useState<KanbanView>('by_agent')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [agentFilter, setAgentFilter] = useState<string | null>(agentIdFilter ?? null)

  useEffect(() => {
    setKanbanView(readStoredView())
  }, [])

  useEffect(() => {
    setAgentFilter(agentIdFilter ?? null)
  }, [agentIdFilter])

  const dashboardQuery = useQuery({
    queryKey: queryKeys.tasks.dashboard(),
    queryFn: () => fetchTasksDashboard(),
  })

  const invalidateDashboard = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.dashboard() })
  }

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: invalidateDashboard,
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: Parameters<typeof updateTask>[1] }) =>
      updateTask(taskId, body),
    onSuccess: invalidateDashboard,
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: invalidateDashboard,
  })

  const runNowMutation = useMutation({
    mutationFn: runTaskNow,
    onSuccess: invalidateDashboard,
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      changeTaskStatus(taskId, { status }),
    onSuccess: invalidateDashboard,
    onError: (error) => {
      setStatusError(error instanceof Error ? error.message : 'Failed to change status')
    },
  })

  const reassignMutation = useMutation({
    mutationFn: ({ taskId, agentId }: { taskId: string; agentId: string }) =>
      reassignTask(taskId, { agentId }),
    onSuccess: invalidateDashboard,
  })

  const createTemplateMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: invalidateDashboard,
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, body }: { templateId: string; body: Parameters<typeof updateTaskTemplate>[1] }) =>
      updateTaskTemplate(templateId, body),
    onSuccess: invalidateDashboard,
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTaskTemplate,
    onSuccess: invalidateDashboard,
  })

  const filteredTasks = useMemo(() => {
    const tasks = dashboardQuery.data?.tasks ?? []
    if (!agentFilter) return tasks
    return tasks.filter((task) => task.agentId === agentFilter)
  }, [dashboardQuery.data?.tasks, agentFilter])

  const busy =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending ||
    runNowMutation.isPending ||
    changeStatusMutation.isPending ||
    reassignMutation.isPending ||
    createTemplateMutation.isPending ||
    updateTemplateMutation.isPending ||
    deleteTemplateMutation.isPending

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1280} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box>
          <Title order={1} ff="var(--font-heading)">
            Tasks
          </Title>
          <Text c="dimmed">Dispatch and schedule work across agents</Text>
        </Box>

        {statusError ? (
          <Alert color="red" title="Status update blocked" withCloseButton onClose={() => setStatusError(null)}>
            {statusError}
          </Alert>
        ) : null}

        {agentFilter && dashboardQuery.data ? (
          <Alert color="sky" title="Filtered by agent">
            <Stack gap="xs">
              <Text size="sm">Showing tasks assigned to {agentFilter}.</Text>
              <Button size="xs" variant="light" w="fit-content" onClick={() => setAgentFilter(null)}>
                Clear filter
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {dashboardQuery.isPending && !dashboardQuery.data ? (
          <Center py="xl">
            <Loader color="sky" />
          </Center>
        ) : null}

        {dashboardQuery.error && !dashboardQuery.data ? (
          <Alert color="red" title="Unable to load tasks">
            <Stack gap="xs">
              <Text size="sm">{dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Unknown error'}</Text>
              <Button variant="light" size="xs" onClick={() => dashboardQuery.refetch()} loading={dashboardQuery.isFetching}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {dashboardQuery.data ? (
          <Box
            style={{
              minHeight: 0,
              flex: 1,
              border: '1px solid var(--mantine-color-slate-2)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--mantine-color-white)',
              opacity: busy ? 0.85 : 1,
            }}
          >
            <Tasks
              tasks={filteredTasks}
              templates={dashboardQuery.data.templates}
              agents={dashboardQuery.data.agents}
              kanbanView={kanbanView}
              selectedTaskId={selectedTaskId}
              onKanbanViewChange={(view) => {
                setKanbanView(view)
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(STORAGE_KEY, view)
                }
              }}
              onSelectTask={(taskId) => setSelectedTaskId(taskId)}
              onCloseTask={() => setSelectedTaskId(null)}
              onCreateTask={(task) => {
                createTaskMutation.mutate({
                  title: task.title,
                  instructions: task.instructions,
                  agentId: task.agentId,
                  schedule: task.schedule,
                  templateId: task.templateId,
                })
              }}
              onDeleteTask={(taskId) => {
                deleteTaskMutation.mutate(taskId)
                setSelectedTaskId(null)
              }}
              onRunNow={(taskId) => runNowMutation.mutate(taskId)}
              onChangeStatus={(taskId, status) => {
                if (status !== 'pending' && status !== 'cancelled') {
                  setStatusError('Only pending and cancelled are supported for manual status changes.')
                  return
                }
                changeStatusMutation.mutate({ taskId, status })
              }}
              onReassignTask={(taskId, agentId) => reassignMutation.mutate({ taskId, agentId })}
              onCreateTemplate={(template) => createTemplateMutation.mutate(template)}
              onUpdateTemplate={(templateId, changes) => updateTemplateMutation.mutate({ templateId, body: changes })}
              onDeleteTemplate={(templateId) => deleteTemplateMutation.mutate(templateId)}
            />
          </Box>
        ) : null}
      </Stack>
    </Box>
  )
}

'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KanbanView, TaskStatus } from '@uss/shared'
import { useRouter } from 'next/navigation'
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
const TASKS_DASHBOARD_ROOT_KEY = ['tasks', 'dashboard'] as const

function readStoredView(): KanbanView {
  if (typeof window === 'undefined') return 'by_agent'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === 'by_status' ? 'by_status' : 'by_agent'
}

export function TasksClient({ initialAgentFilter }: { initialAgentFilter: string | null }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [kanbanView, setKanbanView] = useState<KanbanView>('by_agent')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [agentFilter, setAgentFilter] = useState<string | null>(initialAgentFilter)

  useEffect(() => {
    setKanbanView(readStoredView())
  }, [])

  useEffect(() => {
    setAgentFilter(initialAgentFilter)
  }, [initialAgentFilter])

  const dashboardQuery = useQuery({
    queryKey: queryKeys.tasks.dashboard(agentFilter ?? undefined),
    queryFn: () => fetchTasksDashboard(agentFilter ?? undefined),
  })

  const invalidateTaskData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: TASKS_DASHBOARD_ROOT_KEY }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bridge.dashboard }),
    ])
  }

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: invalidateTaskData,
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: Parameters<typeof updateTask>[1] }) =>
      updateTask(taskId, body),
    onSuccess: invalidateTaskData,
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: invalidateTaskData,
  })

  const runNowMutation = useMutation({
    mutationFn: runTaskNow,
    onSuccess: invalidateTaskData,
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      changeTaskStatus(taskId, { status }),
    onSuccess: invalidateTaskData,
    onError: (error) => {
      setStatusError(error instanceof Error ? error.message : 'Failed to change status')
    },
  })

  const reassignMutation = useMutation({
    mutationFn: ({ taskId, agentId }: { taskId: string; agentId: string }) =>
      reassignTask(taskId, { agentId }),
    onSuccess: invalidateTaskData,
  })

  const createTemplateMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: invalidateTaskData,
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, body }: { templateId: string; body: Parameters<typeof updateTaskTemplate>[1] }) =>
      updateTaskTemplate(templateId, body),
    onSuccess: invalidateTaskData,
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTaskTemplate,
    onSuccess: invalidateTaskData,
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
    deleteTemplateMutation.isPending ||
    dashboardQuery.isFetching

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1280} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Box>
          <Title order={1} ff="var(--font-heading)">
            Tasks
          </Title>
          <Text c="dimmed">Dispatch and schedule work across agents</Text>
        </Box>

        {dashboardQuery.isPending && !dashboardQuery.data ? (
          <Center py="xl">
            <Loader color="sky" />
          </Center>
        ) : null}

        {dashboardQuery.error && !dashboardQuery.data ? (
          <Alert color="red" title="Unable to load tasks">
            <Stack gap="xs">
              <Text size="sm">{dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Unknown error'}</Text>
              <Button variant="light" size="xs" w="fit-content" onClick={() => dashboardQuery.refetch()} loading={dashboardQuery.isFetching}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {statusError ? (
          <Alert color="red" title="Status update blocked" withCloseButton onClose={() => setStatusError(null)}>
            {statusError}
          </Alert>
        ) : null}

        {agentFilter ? (
          <Alert color="sky" title="Filtered by agent">
            <Stack gap="xs">
              <Text size="sm">Showing tasks assigned to {agentFilter}.</Text>
              <Button
                size="xs"
                variant="light"
                w="fit-content"
                onClick={() => {
                  setAgentFilter(null)
                  router.replace('/tasks')
                }}
              >
                Clear filter
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

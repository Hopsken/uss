'use client'

import { Alert, Box, Button, Stack, Text, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import type { KanbanView, TaskStatus, TasksDashboardResponse } from '@uss/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { Tasks } from './Tasks'
import {
  changeTaskStatus,
  createTask,
  createTaskTemplate,
  deleteTask,
  deleteTaskTemplate,
  reassignTask,
  runTaskNow,
  updateTask,
  updateTaskTemplate,
} from '@/lib/api'
import { useRefreshOnFocus } from '@/lib/use-refresh-on-focus'

const STORAGE_KEY = 'uss.tasks.kanbanView'

function readStoredView(): KanbanView {
  if (typeof window === 'undefined') return 'by_agent'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === 'by_status' ? 'by_status' : 'by_agent'
}

export function TasksClient({
  initialData,
  initialAgentFilter,
}: {
  initialData: TasksDashboardResponse
  initialAgentFilter: string | null
}) {
  const router = useRouter()
  const [isRefreshing, startRefreshTransition] = useTransition()
  const [dashboard, setDashboard] = useState<TasksDashboardResponse>(initialData)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [kanbanView, setKanbanView] = useState<KanbanView>('by_agent')
  const [statusError, setStatusError] = useState<string | null>(null)
  const [agentFilter, setAgentFilter] = useState<string | null>(initialAgentFilter)

  useRefreshOnFocus()

  useEffect(() => {
    setKanbanView(readStoredView())
  }, [])

  useEffect(() => {
    setDashboard(initialData)
  }, [initialData])

  useEffect(() => {
    setAgentFilter(initialAgentFilter)
  }, [initialAgentFilter])

  const refreshDashboard = () => {
    startRefreshTransition(() => {
      router.refresh()
    })
  }

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: refreshDashboard,
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: Parameters<typeof updateTask>[1] }) =>
      updateTask(taskId, body),
    onSuccess: refreshDashboard,
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: refreshDashboard,
  })

  const runNowMutation = useMutation({
    mutationFn: runTaskNow,
    onSuccess: refreshDashboard,
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      changeTaskStatus(taskId, { status }),
    onSuccess: refreshDashboard,
    onError: (error) => {
      setStatusError(error instanceof Error ? error.message : 'Failed to change status')
    },
  })

  const reassignMutation = useMutation({
    mutationFn: ({ taskId, agentId }: { taskId: string; agentId: string }) =>
      reassignTask(taskId, { agentId }),
    onSuccess: refreshDashboard,
  })

  const createTemplateMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: refreshDashboard,
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, body }: { templateId: string; body: Parameters<typeof updateTaskTemplate>[1] }) =>
      updateTaskTemplate(templateId, body),
    onSuccess: refreshDashboard,
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTaskTemplate,
    onSuccess: refreshDashboard,
  })

  const filteredTasks = useMemo(() => {
    const tasks = dashboard.tasks
    if (!agentFilter) return tasks
    return tasks.filter((task) => task.agentId === agentFilter)
  }, [dashboard.tasks, agentFilter])

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
    isRefreshing

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

        {agentFilter ? (
          <Alert color="sky" title="Filtered by agent">
            <Stack gap="xs">
              <Text size="sm">Showing tasks assigned to {agentFilter}.</Text>
              <Button size="xs" variant="light" w="fit-content" onClick={() => setAgentFilter(null)}>
                Clear filter
              </Button>
            </Stack>
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
            opacity: busy ? 0.85 : 1,
          }}
        >
          <Tasks
            tasks={filteredTasks}
            templates={dashboard.templates}
            agents={dashboard.agents}
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
      </Stack>
    </Box>
  )
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTaskRequest, TaskStatus, UpdateTaskRequest } from './types'
import { useEffect, useMemo, useState } from 'react'
import {
  changeTaskStatus,
  createTask,
  createTaskTemplate,
  deleteTask,
  deleteTaskTemplate,
  fetchArchivedTasks,
  fetchTasksDashboard,
  reassignTask,
  runTaskNow,
  updateTask,
  updateTaskTemplate,
} from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

const TASKS_DASHBOARD_ROOT_KEY = ['tasks', 'dashboard'] as const

export function useTasksDashboard(initialAgentFilter: string | null) {
  const queryClient = useQueryClient()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [agentFilter, setAgentFilter] = useState<string | null>(initialAgentFilter)

  useEffect(() => {
    setAgentFilter(initialAgentFilter)
  }, [initialAgentFilter])

  const dashboardQuery = useQuery({
    queryKey: queryKeys.tasks.dashboard(agentFilter ?? undefined),
    queryFn: () => fetchTasksDashboard(agentFilter ?? undefined),
  })

  const archivedTasksQuery = useQuery({
    queryKey: queryKeys.tasks.archived(agentFilter ?? undefined),
    queryFn: () => fetchArchivedTasks(agentFilter ?? undefined),
  })

  const invalidateTaskData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: TASKS_DASHBOARD_ROOT_KEY }),
      queryClient.invalidateQueries({ queryKey: ['tasks', 'archived'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bridge.dashboard }),
    ])
  }

  const createTaskMutation = useMutation({
    mutationFn: (body: CreateTaskRequest) => createTask(body),
    onSuccess: invalidateTaskData,
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: UpdateTaskRequest }) => updateTask(taskId, body),
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

  const tasks = dashboardQuery.data?.tasks ?? []
  const archivedTasks = archivedTasksQuery.data?.tasks ?? []
  const recurringTasks = useMemo(
    () => tasks.filter((task) => task.schedule.type === 'recurring'),
    [tasks],
  )
  const agendaTasks = useMemo(
    () => tasks.filter((task) => task.schedule.type === 'one_time'),
    [tasks],
  )

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
    dashboardQuery.isFetching ||
    archivedTasksQuery.isFetching

  return {
    dashboardQuery,
    archivedTasksQuery,
    tasks,
    archivedTasks,
    recurringTasks,
    agendaTasks,
    templates: dashboardQuery.data?.templates ?? [],
    agents: dashboardQuery.data?.agents ?? [],
    busy,
    selectedTaskId,
    setSelectedTaskId,
    statusError,
    setStatusError,
    agentFilter,
    setAgentFilter,
    createTask: (body: CreateTaskRequest) => createTaskMutation.mutate(body),
    updateTask: (taskId: string, body: UpdateTaskRequest) => updateTaskMutation.mutate({ taskId, body }),
    deleteTask: (taskId: string) => {
      deleteTaskMutation.mutate(taskId)
      setSelectedTaskId(null)
    },
    archiveTask: (taskId: string) => {
      changeStatusMutation.mutate({ taskId, status: 'archived' })
      setSelectedTaskId(null)
    },
    restoreTask: (taskId: string) => changeStatusMutation.mutate({ taskId, status: 'pending' }),
    runTaskNow: (taskId: string) => runNowMutation.mutate(taskId),
    changeStatus: (taskId: string, status: TaskStatus) => changeStatusMutation.mutate({ taskId, status }),
    reassignTask: (taskId: string, agentId: string) => reassignMutation.mutate({ taskId, agentId }),
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: (templateId: string, body: Parameters<typeof updateTaskTemplate>[1]) =>
      updateTemplateMutation.mutate({ templateId, body }),
    deleteTemplate: deleteTemplateMutation.mutate,
  }
}

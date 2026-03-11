import { randomUUID } from 'node:crypto'
import type {
  ArchivedTasksResponse,
  AgentRef,
  CreateTaskRequest,
  CreateTaskTemplateRequest,
  TaskMutationResponse,
  TaskReassignRequest,
  TaskRun,
  TasksDashboardResponse,
  TaskStatus,
  TaskStatusChangeRequest,
  UpdateTaskRequest,
  UpdateTaskTemplateRequest,
} from '@uss/shared'
import { logger, type Logger } from '../../infra/logging/logger.js'
import { mapChangelog, mapRun, mapTask, computeNextRunAtUtc, nextStatusAfterSuccess } from './tasks.mapper.js'
import { tasksGatewayRepository, type TasksGatewayRepository } from './tasks.gateway.repository.js'
import { tasksLocalRepository, type TasksLocalRepository } from './tasks.local.repository.js'

type TasksLogger = Pick<Logger, 'error' | 'warn' | 'info'>

export type TasksService = {
  loadDashboard: (agentId?: string) => Promise<TasksDashboardResponse>
  loadArchivedTasks: (agentId?: string) => Promise<ArchivedTasksResponse>
  createTask: (body: CreateTaskRequest) => Promise<TaskMutationResponse>
  updateTask: (taskId: string, body: UpdateTaskRequest) => Promise<TaskMutationResponse | null>
  deleteTask: (taskId: string) => Promise<TaskMutationResponse | null>
  runNow: (taskId: string) => Promise<TaskMutationResponse | null>
  changeStatus: (taskId: string, body: TaskStatusChangeRequest) => Promise<TaskMutationResponse | null>
  reassignTask: (taskId: string, body: TaskReassignRequest) => Promise<TaskMutationResponse | null>
  listTaskRuns: (taskId: string) => Promise<TaskRun[] | null>
  createTemplate: (body: CreateTaskTemplateRequest) => Promise<void>
  updateTemplate: (templateId: string, body: UpdateTaskTemplateRequest) => Promise<boolean>
  deleteTemplate: (templateId: string) => Promise<boolean>
  runDueTasks: () => Promise<void>
}

export type TasksServiceDeps = {
  localRepository: TasksLocalRepository
  gatewayRepository: TasksGatewayRepository
  logger: TasksLogger
}

function nowIso(): string {
  return new Date().toISOString()
}

function toMutation(taskId: string, warnings?: string[]): TaskMutationResponse {
  return {
    ok: true,
    taskId,
    syncedAt: nowIso(),
    warnings: warnings && warnings.length > 0 ? warnings : undefined,
  }
}

async function loadAgentsMap(gatewayRepository: TasksGatewayRepository): Promise<Map<string, AgentRef>> {
  const agents = await gatewayRepository.fetchAgents()
  return new Map(agents.map((agent) => [agent.id, agent]))
}

async function ensureAgentExists(gatewayRepository: TasksGatewayRepository, agentId: string): Promise<void> {
  const agents = await gatewayRepository.fetchAgents()
  if (!agents.some((agent) => agent.id === agentId)) {
    throw new Error(`unknown_agent:${agentId}`)
  }
}

export function createTasksService(deps: TasksServiceDeps): TasksService {
  return {
    async loadDashboard(agentId): Promise<TasksDashboardResponse> {
      await deps.localRepository.ensureTables()

      const [tasks, templates] = await Promise.all([
        deps.localRepository.listTasks(agentId),
        deps.localRepository.listTemplates(),
      ])
      let agentMap = new Map<string, AgentRef>()
      try {
        agentMap = await loadAgentsMap(deps.gatewayRepository)
      } catch (error) {
        deps.logger.warn('Failed to fetch agents from gateway, using task-local fallback')
        for (const task of tasks) {
          if (!agentMap.has(task.agentId)) {
            agentMap.set(task.agentId, {
              id: task.agentId,
              name: task.agentId,
              role: 'Agent',
            })
          }
        }
      }

      const taskIds = tasks.map((task) => task.id)
      const [changelogByTask, latestRuns] = await Promise.all([
        deps.localRepository.listChangelogByTaskIds(taskIds),
        deps.localRepository.getLatestRunsByTaskIds(taskIds),
      ])

      const mappedTasks = tasks.map((task) =>
        mapTask({
          task,
          agentById: agentMap,
          changelog: mapChangelog(changelogByTask.get(task.id) ?? []),
          latestRun: latestRuns.get(task.id) ?? null,
        }),
      )

      return {
        tasks: mappedTasks,
        templates,
        agents: Array.from(agentMap.values()),
        syncedAt: nowIso(),
      }
    },

    async loadArchivedTasks(agentId): Promise<ArchivedTasksResponse> {
      await deps.localRepository.ensureTables()

      const tasks = await deps.localRepository.listArchivedTasks(agentId)

      let agentMap = new Map<string, AgentRef>()
      try {
        agentMap = await loadAgentsMap(deps.gatewayRepository)
      } catch {
        for (const task of tasks) {
          if (!agentMap.has(task.agentId)) {
            agentMap.set(task.agentId, {
              id: task.agentId,
              name: task.agentId,
              role: 'Agent',
            })
          }
        }
      }

      const taskIds = tasks.map((task) => task.id)
      const [changelogByTask, latestRuns] = await Promise.all([
        deps.localRepository.listChangelogByTaskIds(taskIds),
        deps.localRepository.getLatestRunsByTaskIds(taskIds),
      ])

      return {
        tasks: tasks.map((task) =>
          mapTask({
            task,
            agentById: agentMap,
            changelog: mapChangelog(changelogByTask.get(task.id) ?? []),
            latestRun: latestRuns.get(task.id) ?? null,
          }),
        ),
        syncedAt: nowIso(),
      }
    },

    async createTask(body) {
      await deps.localRepository.ensureTables()
      await ensureAgentExists(deps.gatewayRepository, body.agentId)

      const nowMs = Date.now()
      const nextRunAtUtc = computeNextRunAtUtc({
        schedule: body.schedule,
        fromMs: nowMs,
      })

      const created = await deps.localRepository.createTask({
        title: body.title,
        instructionsBase: body.instructions,
        agentId: body.agentId,
        status: 'pending',
        schedule: body.schedule,
        templateId: body.templateId,
        nextRunAtUtc,
      })

      await deps.localRepository.insertChangelog({
        taskId: created.id,
        type: 'task_created',
        message: 'Task created',
        detail: 'Task created',
        occurredAtUtc: nowMs,
      })

      return toMutation(created.id)
    },

    async updateTask(taskId, body) {
      await deps.localRepository.ensureTables()

      const current = await deps.localRepository.getTaskById(taskId)
      if (!current) return null

      if (body.agentId) {
        await ensureAgentExists(deps.gatewayRepository, body.agentId)
      }

      const updated = await deps.localRepository.updateTask(taskId, {
        title: body.title,
        instructionsBase: body.instructions,
        agentId: body.agentId,
        schedule: body.schedule,
        templateId: body.templateId,
        nextRunAtUtc:
          body.schedule ? computeNextRunAtUtc({ schedule: body.schedule, fromMs: Date.now() }) : undefined,
      })

      if (!updated) return null

      await deps.localRepository.insertChangelog({
        taskId,
        type: 'task_updated',
        message: 'Task updated',
        detail: 'Task fields updated',
        occurredAtUtc: Date.now(),
      })

      return toMutation(taskId)
    },

    async deleteTask(taskId) {
      await deps.localRepository.ensureTables()
      const current = await deps.localRepository.getTaskById(taskId)
      if (!current) return null
      if (current.status === 'running') {
        throw new Error('task_running')
      }

      await deps.localRepository.deleteTask(taskId)

      return toMutation(taskId)
    },

    async runNow(taskId) {
      const task = await deps.localRepository.getTaskById(taskId)
      if (!task) return null
      await executeTask({
        deps,
        taskId,
        trigger: 'manual',
      })
      return toMutation(taskId)
    },

    async changeStatus(taskId, body) {
      const task = await deps.localRepository.getTaskById(taskId)
      if (!task) return null

      const allowedStatuses: TaskStatus[] =
        task.schedule.type === 'one_time'
          ? ['pending', 'done', 'cancelled', 'archived']
          : ['pending', 'cancelled', 'archived']

      if (task.status === 'running' && body.status === 'archived') {
        throw new Error('unsupported_status_transition')
      }

      if (task.status === 'archived' && body.status !== 'pending') {
        throw new Error('unsupported_status_transition')
      }

      if (task.status !== 'archived' && body.status === 'pending' && task.status !== 'pending') {
        if (!(task.schedule.type === 'one_time' && ['done', 'cancelled', 'failed'].includes(task.status))) {
          if (!(task.schedule.type === 'recurring' && ['cancelled', 'failed'].includes(task.status))) {
            throw new Error('unsupported_status_transition')
          }
        }
      }

      if (!allowedStatuses.includes(body.status)) {
        throw new Error('unsupported_status_transition')
      }

      const nextRunAtUtc =
        body.status === 'pending'
          ? computeNextRunAtUtc({ schedule: task.schedule, fromMs: Date.now() })
          : null

      await deps.localRepository.updateTask(taskId, {
        status: body.status,
        cancelledAt: body.status === 'cancelled' ? Date.now() : null,
        lastRunAtUtc: body.status === 'done' ? Date.now() : undefined,
        lastRunStatus: body.status === 'done' ? 'success' : body.status === 'pending' ? 'never' : undefined,
        lastRunError: body.status === 'pending' || body.status === 'done' ? null : undefined,
        nextRunAtUtc,
        lockOwner: body.status === 'archived' ? null : undefined,
        lockUntilUtc: body.status === 'archived' ? null : undefined,
      })

      const detail =
        body.status === 'archived'
          ? 'Archived by user'
          : task.status === 'archived' && body.status === 'pending'
            ? 'Restored from archive'
            : `Changed to ${body.status}`

      await deps.localRepository.insertChangelog({
        taskId,
        type: 'status_changed',
        message: 'Status changed',
        detail,
        occurredAtUtc: Date.now(),
      })

      return toMutation(taskId)
    },

    async reassignTask(taskId, body) {
      await ensureAgentExists(deps.gatewayRepository, body.agentId)

      const task = await deps.localRepository.getTaskById(taskId)
      if (!task) return null

      await deps.localRepository.updateTask(taskId, {
        agentId: body.agentId,
      })

      await deps.localRepository.insertChangelog({
        taskId,
        type: 'agent_assigned',
        message: 'Agent assigned',
        detail: `Assigned to ${body.agentId}`,
        occurredAtUtc: Date.now(),
      })

      return toMutation(taskId)
    },

    async listTaskRuns(taskId) {
      const task = await deps.localRepository.getTaskById(taskId)
      if (!task) return null

      const runs = await deps.localRepository.listRuns(taskId)
      return runs.map(mapRun)
    },

    async createTemplate(body) {
      await deps.localRepository.createTemplate(body)
    },

    async updateTemplate(templateId, body) {
      const updated = await deps.localRepository.updateTemplate(templateId, body)
      return Boolean(updated)
    },

    async deleteTemplate(templateId) {
      return deps.localRepository.deleteTemplate(templateId)
    },

    async runDueTasks() {
      await deps.localRepository.ensureTables()
      const nowMs = Date.now()
      const owner = `worker-${process.pid}`
      const dueIds = await deps.localRepository.listDueTaskIds(nowMs, 20)

      for (const taskId of dueIds) {
        const claimed = await deps.localRepository.tryClaimTask(taskId, owner, nowMs + 60_000, nowMs)
        if (!claimed) continue

        await executeTask({
          deps,
          taskId,
          trigger: 'schedule',
          owner,
        })
      }
    },
  }
}

async function executeTask(params: {
  deps: TasksServiceDeps
  taskId: string
  trigger: 'schedule' | 'manual'
  owner?: string
}) {
  const task = await params.deps.localRepository.getTaskById(params.taskId)
  if (!task) return

  const startedAt = Date.now()
  const idempotencyKey = `uss:task-run:${randomUUID()}`

  await params.deps.localRepository.updateTask(task.id, {
    status: 'running',
    lockOwner: params.owner ?? `manual-${process.pid}`,
    lockUntilUtc: startedAt + 5 * 60_000,
    lastRunStatus: 'running',
    lastRunError: null,
  })

  await params.deps.localRepository.insertChangelog({
    taskId: task.id,
    type: 'run_triggered',
    message: 'Run triggered',
    detail: params.trigger === 'manual' ? 'Run now clicked' : 'Scheduled run started',
    occurredAtUtc: startedAt,
  })

  const run = await params.deps.localRepository.createRun({
    taskId: task.id,
    trigger: params.trigger,
    status: 'running',
    startedAtUtc: startedAt,
    endedAtUtc: null,
    openclawRunId: null,
    executionLogText: `[${new Date(startedAt).toISOString()}] Dispatched to ${task.agentId}`,
    errorMessage: null,
    idempotencyKey,
  })

  try {
    const runStart = await params.deps.gatewayRepository.runAgent({
      agentId: task.agentId,
      message: task.instructionsBase,
      idempotencyKey,
    })

    const waitResult = await params.deps.gatewayRepository.waitForAgent(runStart.runId)
    const endedAt = Date.now()

    const runStatus =
      waitResult.status === 'ok' ? 'success' : waitResult.status === 'error' ? 'failed' : 'timeout'

    const nextStatus =
      runStatus === 'success'
        ? nextStatusAfterSuccess(task)
        : ('failed' as TaskStatus)

    const nextRunAtUtc =
      runStatus === 'success' && task.schedule.type === 'recurring'
        ? computeNextRunAtUtc({ schedule: task.schedule, fromMs: endedAt })
        : runStatus !== 'success' && task.schedule.type === 'recurring'
          ? computeNextRunAtUtc({ schedule: task.schedule, fromMs: endedAt })
          : null

    const logLine =
      runStatus === 'success'
        ? `[${new Date(endedAt).toISOString()}] Completed successfully`
        : `[${new Date(endedAt).toISOString()}] Failed: ${waitResult.error ?? runStatus}`

    await params.deps.localRepository.updateRun(run.id, {
      status: runStatus,
      endedAtUtc: endedAt,
      openclawRunId: runStart.runId,
      errorMessage: waitResult.error,
      executionLogText: `${run.executionLogText ?? ''}\n${logLine}`.trim(),
    })

    await params.deps.localRepository.updateTask(task.id, {
      status: nextStatus,
      nextRunAtUtc,
      lastRunAtUtc: endedAt,
      lastRunStatus: runStatus === 'success' ? 'success' : runStatus,
      lastRunError: waitResult.error,
      lockOwner: null,
      lockUntilUtc: null,
    })

    await params.deps.localRepository.insertChangelog({
      taskId: task.id,
      type: 'status_changed',
      message: 'Status changed',
      detail: `Execution ${runStatus}`,
      occurredAtUtc: endedAt,
    })
  } catch (error) {
    const endedAt = Date.now()
    const message = error instanceof Error ? error.message : String(error)

    params.deps.logger.error({
      taskId: task.id,
      error,
    }, 'Task execution failed')

    await params.deps.localRepository.updateRun(run.id, {
      status: 'failed',
      endedAtUtc: endedAt,
      errorMessage: message,
      executionLogText: `${run.executionLogText ?? ''}\n[${new Date(endedAt).toISOString()}] Failed: ${message}`.trim(),
    })

    await params.deps.localRepository.updateTask(task.id, {
      status: 'failed',
      nextRunAtUtc:
        task.schedule.type === 'recurring'
          ? computeNextRunAtUtc({ schedule: task.schedule, fromMs: endedAt })
          : null,
      lastRunAtUtc: endedAt,
      lastRunStatus: 'failed',
      lastRunError: message,
      lockOwner: null,
      lockUntilUtc: null,
    })
  }
}

export const tasksService = createTasksService({
  localRepository: tasksLocalRepository,
  gatewayRepository: tasksGatewayRepository,
  logger: logger.child({ module: 'tasks' }),
})

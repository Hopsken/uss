import test from 'node:test'
import assert from 'node:assert/strict'
import type { TaskTemplate } from '@uss/shared'
import { createTasksService } from './tasks.service.js'
import type { TasksGatewayRepository } from './tasks.gateway.repository.js'
import type { LocalTaskRecord, LocalTaskRunRecord, TasksLocalRepository } from './tasks.local.repository.js'

function makeTask(overrides: Partial<LocalTaskRecord> = {}): LocalTaskRecord {
  const now = Date.now()
  return {
    id: 'task-1',
    title: 'Task',
    instructionsBase: 'Do it',
    agentId: 'agent-1',
    status: 'pending',
    schedule: {
      type: 'one_time',
      scheduledAt: new Date(now + 60 * 60 * 1000).toISOString(),
      humanReadable: 'Later',
    },
    templateId: null,
    nextRunAtUtc: now + 60 * 60 * 1000,
    lastRunAtUtc: null,
    lastRunStatus: 'never',
    lastRunError: null,
    lockOwner: null,
    lockUntilUtc: null,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    ...overrides,
  }
}

function createLocalRepository(seedTasks: LocalTaskRecord[]): TasksLocalRepository {
  const tasks = new Map(seedTasks.map((task) => [task.id, task]))
  const runs = new Map<string, LocalTaskRunRecord[]>()
  const changelog = new Map<string, Array<{ id: string; taskId: string; type: string; message: string; detail: string; occurredAtUtc: number }>>()
  const templates: TaskTemplate[] = []

  return {
    ensureTables: async () => undefined,
    listTasks: async () => Array.from(tasks.values()).filter((task) => task.status !== 'archived'),
    listArchivedTasks: async () => Array.from(tasks.values()).filter((task) => task.status === 'archived'),
    getTaskById: async (taskId) => tasks.get(taskId) ?? null,
    createTask: async (params) => {
      const now = Date.now()
      const created: LocalTaskRecord = {
        id: `task-${tasks.size + 1}`,
        title: params.title,
        instructionsBase: params.instructionsBase,
        agentId: params.agentId,
        status: params.status,
        schedule: params.schedule,
        templateId: params.templateId,
        nextRunAtUtc: params.nextRunAtUtc,
        lastRunAtUtc: null,
        lastRunStatus: 'never',
        lastRunError: null,
        lockOwner: null,
        lockUntilUtc: null,
        createdAt: now,
        updatedAt: now,
        cancelledAt: null,
      }
      tasks.set(created.id, created)
      return created
    },
    updateTask: async (taskId, changes) => {
      const current = tasks.get(taskId)
      if (!current) return null
      const next = {
        ...current,
        ...changes,
        updatedAt: Date.now(),
      }
      tasks.set(taskId, next)
      return next
    },
    deleteTask: async (taskId) => {
      runs.delete(taskId)
      changelog.delete(taskId)
      return tasks.delete(taskId)
    },
    listDueTaskIds: async () => [],
    tryClaimTask: async () => false,
    createRun: async () => {
      throw new Error('not_implemented')
    },
    updateRun: async () => null,
    listRuns: async (taskId) => runs.get(taskId) ?? [],
    getLatestRunsByTaskIds: async () => new Map(),
    insertChangelog: async (entry) => {
      const current = changelog.get(entry.taskId) ?? []
      current.unshift({
        id: `log-${current.length + 1}`,
        ...entry,
      })
      changelog.set(entry.taskId, current)
    },
    listChangelogByTaskIds: async (taskIds) =>
      new Map(taskIds.map((taskId) => [taskId, changelog.get(taskId) ?? []])),
    listTemplates: async () => templates,
    createTemplate: async () => {
      throw new Error('not_implemented')
    },
    updateTemplate: async () => null,
    deleteTemplate: async () => false,
  }
}

function createGatewayRepository(): TasksGatewayRepository {
  return {
    fetchAgents: async () => [{ id: 'agent-1', name: 'Agent One', role: 'Operator' }],
    runAgent: async () => ({ runId: 'run-1' }),
    waitForAgent: async () => ({ status: 'ok', error: null }),
  }
}

function createService(tasks: LocalTaskRecord[]) {
  return createTasksService({
    localRepository: createLocalRepository(tasks),
    gatewayRepository: createGatewayRepository(),
    logger: {
      error: () => undefined,
      warn: () => undefined,
      info: () => undefined,
    },
  })
}

test('deleteTask permanently removes the task', async () => {
  const service = createService([makeTask()])

  const result = await service.deleteTask('task-1')
  const archived = await service.loadArchivedTasks()
  const dashboard = await service.loadDashboard()

  assert.equal(result?.ok, true)
  assert.equal(dashboard.tasks.length, 0)
  assert.equal(archived.tasks.length, 0)
})

test('deleteTask rejects running tasks', async () => {
  const service = createService([makeTask({ status: 'running' })])

  await assert.rejects(() => service.deleteTask('task-1'), /task_running/)
})

test('loadArchivedTasks returns archived tasks only', async () => {
  const service = createService([
    makeTask({ id: 'active-1', status: 'pending' }),
    makeTask({ id: 'archived-1', status: 'archived' }),
  ])

  const response = await service.loadArchivedTasks()

  assert.deepEqual(response.tasks.map((task) => task.id), ['archived-1'])
  assert.equal(response.tasks[0]?.status, 'archived')
})

test('changeStatus archives and restores a task', async () => {
  const service = createService([makeTask({ status: 'failed', lastRunStatus: 'failed' })])

  const archived = await service.changeStatus('task-1', { status: 'archived' })
  const restored = await service.changeStatus('task-1', { status: 'pending' })
  const dashboard = await service.loadDashboard()

  assert.equal(archived?.ok, true)
  assert.equal(restored?.ok, true)
  assert.equal(dashboard.tasks[0]?.status, 'pending')
})

test('createTask rejects recurring weekdays schedule without cron expression', async () => {
  const service = createService([])

  await assert.rejects(
    () =>
      service.createTask({
        title: 'Weekday report',
        instructions: 'Compile daily report',
        agentId: 'agent-1',
        templateId: null,
        schedule: {
          type: 'recurring',
          preset: 'weekdays',
          timezone: 'America/New_York',
          humanReadable: 'Every weekday at 9:00 AM (America/New_York)',
        },
      }),
    /invalid_schedule/,
  )
})

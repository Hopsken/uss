import test from 'node:test'
import assert from 'node:assert/strict'
import { Elysia } from 'elysia'
import { createTasksRoutes } from './tasks.routes.js'

function createController() {
  return {
    getDashboard: async () => ({
      tasks: [],
      templates: [],
      agents: [],
      syncedAt: '2026-03-04T00:00:00.000Z',
    }),
    getArchivedTasks: async () => ({
      tasks: [],
      syncedAt: '2026-03-04T00:00:00.000Z',
    }),
    postTask: async () => ({ ok: true as const, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
    patchTask: async () => ({ ok: true as const, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
    deleteTask: async () => ({ ok: true as const, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
    postRunNow: async () => ({ ok: true as const, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
    patchTaskStatus: async () => ({ ok: true as const, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
    patchTaskReassign: async () => ({ ok: true as const, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
    getTaskRuns: async () => [],
    postTemplate: async () => undefined,
    patchTemplate: async () => true,
    deleteTemplate: async () => true,
  }
}

test('GET /v1/tasks returns dashboard payload', async () => {
  const app = new Elysia({ prefix: '/v1' }).use(createTasksRoutes(createController()))

  const response = await app.handle(new Request('http://localhost/v1/tasks'))
  const body = (await response.json()) as { tasks: unknown[] }

  assert.equal(response.status, 200)
  assert.equal(body.tasks.length, 0)
})

test('GET /v1/tasks/archived returns archived tasks payload', async () => {
  const app = new Elysia({ prefix: '/v1' }).use(
    createTasksRoutes({
      ...createController(),
      getArchivedTasks: async () => ({
        tasks: [
          {
            id: 't-archived',
            title: 'Archived task',
            instructions: 'Keep',
            agentId: 'agent-1',
            agentName: 'Agent One',
            agentRole: 'Operator',
            status: 'archived' as const,
            schedule: { type: 'one_time' as const, humanReadable: 'Tomorrow' },
            createdAt: '2026-03-04T00:00:00.000Z',
            updatedAt: '2026-03-04T01:00:00.000Z',
            completedAt: null,
            nextRunAt: null,
            templateId: null,
            changelog: [],
            executionLog: null,
            lastRunStatus: 'never',
            lastRunAt: null,
            lastRunError: null,
          },
        ],
        syncedAt: '2026-03-04T00:00:00.000Z',
      }),
    }),
  )

  const response = await app.handle(new Request('http://localhost/v1/tasks/archived'))
  const body = (await response.json()) as { tasks: Array<{ status: string }> }

  assert.equal(response.status, 200)
  assert.equal(body.tasks[0]?.status, 'archived')
})

test('DELETE /v1/tasks/:taskId maps task_running to 400', async () => {
  const app = new Elysia({ prefix: '/v1' }).use(
    createTasksRoutes({
      ...createController(),
      deleteTask: async () => {
        throw new Error('task_running')
      },
    }),
  )

  const response = await app.handle(new Request('http://localhost/v1/tasks/t-1', { method: 'DELETE' }))
  const body = (await response.json()) as { error: string }

  assert.equal(response.status, 400)
  assert.equal(body.error, 'task_running')
})

test('POST /v1/tasks maps invalid_schedule to 400', async () => {
  const app = new Elysia({ prefix: '/v1' }).use(
    createTasksRoutes({
      ...createController(),
      postTask: async () => {
        throw new Error('invalid_schedule')
      },
    }),
  )

  const response = await app.handle(new Request('http://localhost/v1/tasks', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Weekday report',
      instructions: 'Compile daily report',
      agentId: 'agent-1',
      templateId: null,
      schedule: {
        type: 'recurring',
        preset: 'weekdays',
        cronExpression: '30 9 * * 1-5',
        timezone: 'America/New_York',
        humanReadable: 'Every weekday at 9:30 AM (America/New_York)',
      },
    }),
  }))
  const body = (await response.json()) as { error: string }

  assert.equal(response.status, 400)
  assert.equal(body.error, 'invalid_schedule')
})

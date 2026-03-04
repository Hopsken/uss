import test from 'node:test'
import assert from 'node:assert/strict'
import { Elysia } from 'elysia'
import { createTasksRoutes } from './tasks.routes.js'

test('GET /v1/tasks returns dashboard payload', async () => {
  const app = new Elysia({ prefix: '/v1' }).use(
    createTasksRoutes({
      getDashboard: async () => ({
        tasks: [],
        templates: [],
        agents: [],
        syncedAt: '2026-03-04T00:00:00.000Z',
      }),
      postTask: async () => ({ ok: true, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
      patchTask: async () => ({ ok: true, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
      deleteTask: async () => ({ ok: true, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
      postRunNow: async () => ({ ok: true, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
      patchTaskStatus: async () => ({ ok: true, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
      patchTaskReassign: async () => ({ ok: true, taskId: 't1', syncedAt: '2026-03-04T00:00:00.000Z' }),
      getTaskRuns: async () => [],
      postTemplate: async () => undefined,
      patchTemplate: async () => true,
      deleteTemplate: async () => true,
    }),
  )

  const response = await app.handle(new Request('http://localhost/v1/tasks'))
  const body = (await response.json()) as { tasks: unknown[] }

  assert.equal(response.status, 200)
  assert.equal(body.tasks.length, 0)
})

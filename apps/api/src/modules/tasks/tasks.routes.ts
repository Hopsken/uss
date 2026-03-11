import { Elysia, t } from 'elysia'
import { tasksController } from './tasks.controller.js'
import {
  archivedTasksResponseSchema,
  badRequestSchema,
  createTaskBodySchema,
  mutationResponseSchema,
  notFoundSchema,
  taskReassignBodySchema,
  taskRunsResponseSchema,
  taskStatusChangeBodySchema,
  taskTemplateBodySchema,
  tasksDashboardResponseSchema,
  updateTaskBodySchema,
  updateTaskTemplateBodySchema,
} from './tasks.model.js'

export function createTasksRoutes(controller = tasksController) {
  return new Elysia({ name: 'tasks-routes' })
    .get(
      '/tasks',
      async ({ query }) => controller.getDashboard(query.agentId),
      {
        query: t.Object({
          agentId: t.Optional(t.String()),
        }),
        response: tasksDashboardResponseSchema,
      },
    )
    .get(
      '/tasks/archived',
      async ({ query }) => controller.getArchivedTasks(query.agentId),
      {
        query: t.Object({
          agentId: t.Optional(t.String()),
        }),
        response: archivedTasksResponseSchema,
      },
    )
    .post('/tasks', async ({ body }) => controller.postTask(body), {
      body: createTaskBodySchema,
      response: mutationResponseSchema,
    })
    .patch(
      '/tasks/:taskId',
      async ({ params, body, set }) => {
        const result = await controller.patchTask(params.taskId, body)
        if (!result) {
          set.status = 404
          return { error: 'not_found' }
        }
        return result
      },
      {
        params: t.Object({
          taskId: t.String({ minLength: 1 }),
        }),
        body: updateTaskBodySchema,
        response: {
          200: mutationResponseSchema,
          404: notFoundSchema,
        },
      },
    )
    .delete(
      '/tasks/:taskId',
      async ({ params, set }) => {
        try {
          const result = await controller.deleteTask(params.taskId)
          if (!result) {
            set.status = 404
            return { error: 'not_found' }
          }
          return result
        } catch (error) {
          const message = error instanceof Error ? error.message : 'bad_request'
          if (message === 'task_running') {
            set.status = 400
            return { error: message }
          }
          throw error
        }
      },
      {
        params: t.Object({
          taskId: t.String({ minLength: 1 }),
        }),
        response: {
          200: mutationResponseSchema,
          400: badRequestSchema,
          404: notFoundSchema,
        },
      },
    )
    .post(
      '/tasks/:taskId/run-now',
      async ({ params, set }) => {
        const result = await controller.postRunNow(params.taskId)
        if (!result) {
          set.status = 404
          return { error: 'not_found' }
        }
        return result
      },
      {
        params: t.Object({
          taskId: t.String({ minLength: 1 }),
        }),
        response: {
          200: mutationResponseSchema,
          404: notFoundSchema,
        },
      },
    )
    .patch(
      '/tasks/:taskId/status',
      async ({ params, body, set }) => {
        try {
          const result = await controller.patchTaskStatus(params.taskId, body)
          if (!result) {
            set.status = 404
            return { error: 'not_found' }
          }
          return result
        } catch (error) {
          const message = error instanceof Error ? error.message : 'bad_request'
          if (message === 'unsupported_status_transition') {
            set.status = 400
            return { error: message }
          }
          throw error
        }
      },
      {
        params: t.Object({
          taskId: t.String({ minLength: 1 }),
        }),
        body: taskStatusChangeBodySchema,
        response: {
          200: mutationResponseSchema,
          400: badRequestSchema,
          404: notFoundSchema,
        },
      },
    )
    .patch(
      '/tasks/:taskId/reassign',
      async ({ params, body, set }) => {
        const result = await controller.patchTaskReassign(params.taskId, body)
        if (!result) {
          set.status = 404
          return { error: 'not_found' }
        }
        return result
      },
      {
        params: t.Object({ taskId: t.String({ minLength: 1 }) }),
        body: taskReassignBodySchema,
        response: {
          200: mutationResponseSchema,
          404: notFoundSchema,
        },
      },
    )
    .get(
      '/tasks/:taskId/runs',
      async ({ params, set }) => {
        const runs = await controller.getTaskRuns(params.taskId)
        if (!runs) {
          set.status = 404
          return { error: 'not_found' }
        }
        return { runs }
      },
      {
        params: t.Object({ taskId: t.String({ minLength: 1 }) }),
        response: {
          200: taskRunsResponseSchema,
          404: notFoundSchema,
        },
      },
    )
    .post('/tasks/templates', async ({ body }) => {
      await controller.postTemplate(body)
      return { ok: true }
    }, {
      body: taskTemplateBodySchema,
      response: t.Object({ ok: t.Literal(true) }),
    })
    .patch(
      '/tasks/templates/:templateId',
      async ({ params, body, set }) => {
        const updated = await controller.patchTemplate(params.templateId, body)
        if (!updated) {
          set.status = 404
          return { error: 'not_found' }
        }
        return { ok: true }
      },
      {
        params: t.Object({ templateId: t.String({ minLength: 1 }) }),
        body: updateTaskTemplateBodySchema,
        response: {
          200: t.Object({ ok: t.Literal(true) }),
          404: notFoundSchema,
        },
      },
    )
    .delete(
      '/tasks/templates/:templateId',
      async ({ params, set }) => {
        const deleted = await controller.deleteTemplate(params.templateId)
        if (!deleted) {
          set.status = 404
          return { error: 'not_found' }
        }
        return { ok: true }
      },
      {
        params: t.Object({ templateId: t.String({ minLength: 1 }) }),
        response: {
          200: t.Object({ ok: t.Literal(true) }),
          404: notFoundSchema,
        },
      },
    )
}

export const tasksRoutes = createTasksRoutes()

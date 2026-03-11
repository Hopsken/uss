import { t } from 'elysia'

export const taskStatusSchema = t.Union([
  t.Literal('pending'),
  t.Literal('running'),
  t.Literal('done'),
  t.Literal('failed'),
  t.Literal('cancelled'),
])

export const taskLastRunStatusSchema = t.Union([
  t.Literal('never'),
  t.Literal('success'),
  t.Literal('failed'),
  t.Literal('timeout'),
  t.Literal('running'),
])

export const taskScheduleSchema = t.Object({
  type: t.Union([t.Literal('one_time'), t.Literal('recurring')]),
  scheduledAt: t.Optional(t.String()),
  preset: t.Optional(
    t.Union([
      t.Literal('hourly'),
      t.Literal('daily'),
      t.Literal('weekly'),
      t.Literal('monthly'),
      t.Literal('custom'),
    ]),
  ),
  cronExpression: t.Optional(t.String()),
  humanReadable: t.String(),
})

export const changelogEntrySchema = t.Object({
  id: t.String(),
  type: t.Union([
    t.Literal('task_created'),
    t.Literal('status_changed'),
    t.Literal('agent_assigned'),
    t.Literal('task_updated'),
    t.Literal('run_triggered'),
  ]),
  message: t.String(),
  detail: t.String(),
  occurredAt: t.String(),
})

export const taskSchema = t.Object({
  id: t.String(),
  title: t.String(),
  instructions: t.String(),
  agentId: t.String(),
  agentName: t.String(),
  agentRole: t.String(),
  status: taskStatusSchema,
  schedule: taskScheduleSchema,
  createdAt: t.String(),
  updatedAt: t.String(),
  completedAt: t.Nullable(t.String()),
  nextRunAt: t.Nullable(t.String()),
  templateId: t.Nullable(t.String()),
  changelog: t.Array(changelogEntrySchema),
  executionLog: t.Nullable(t.String()),
  lastRunStatus: taskLastRunStatusSchema,
  lastRunAt: t.Nullable(t.String()),
  lastRunError: t.Nullable(t.String()),
  automationStatus: t.Optional(
    t.Union([
      t.Literal('running'),
      t.Literal('attention'),
      t.Literal('due_soon'),
      t.Literal('healthy'),
      t.Literal('paused'),
    ]),
  ),
  agendaBucket: t.Optional(
    t.Union([
      t.Literal('overdue'),
      t.Literal('today'),
      t.Literal('upcoming'),
      t.Literal('completed'),
      t.Literal('cancelled'),
    ]),
  ),
  agendaState: t.Optional(
    t.Union([
      t.Literal('queued'),
      t.Literal('in_progress'),
      t.Literal('blocked'),
      t.Literal('done'),
      t.Literal('cancelled'),
    ]),
  ),
})

export const agentRefSchema = t.Object({
  id: t.String(),
  name: t.String(),
  role: t.String(),
})

export const taskTemplateSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  defaultInstructions: t.String(),
  suggestedAgentId: t.Optional(t.String()),
})

export const tasksDashboardResponseSchema = t.Object({
  tasks: t.Array(taskSchema),
  templates: t.Array(taskTemplateSchema),
  agents: t.Array(agentRefSchema),
  syncedAt: t.String(),
})

export const createTaskBodySchema = t.Object({
  title: t.String({ minLength: 1 }),
  instructions: t.String(),
  agentId: t.String({ minLength: 1 }),
  schedule: taskScheduleSchema,
  templateId: t.Nullable(t.String()),
})

export const updateTaskBodySchema = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  instructions: t.Optional(t.String()),
  agentId: t.Optional(t.String({ minLength: 1 })),
  schedule: t.Optional(taskScheduleSchema),
  templateId: t.Optional(t.Nullable(t.String())),
})

export const taskStatusChangeBodySchema = t.Object({
  status: taskStatusSchema,
})

export const taskReassignBodySchema = t.Object({
  agentId: t.String({ minLength: 1 }),
})

export const mutationResponseSchema = t.Object({
  ok: t.Literal(true),
  taskId: t.String(),
  syncedAt: t.String(),
  warnings: t.Optional(t.Array(t.String())),
})

export const taskTemplateBodySchema = t.Object({
  name: t.String({ minLength: 1 }),
  description: t.String(),
  defaultInstructions: t.String(),
  suggestedAgentId: t.Optional(t.String()),
})

export const updateTaskTemplateBodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  description: t.Optional(t.String()),
  defaultInstructions: t.Optional(t.String()),
  suggestedAgentId: t.Optional(t.String()),
})

export const taskRunSchema = t.Object({
  id: t.String(),
  taskId: t.String(),
  trigger: t.Union([t.Literal('schedule'), t.Literal('manual')]),
  status: t.Union([t.Literal('running'), t.Literal('success'), t.Literal('failed'), t.Literal('timeout')]),
  startedAt: t.String(),
  endedAt: t.Nullable(t.String()),
  executionLog: t.Nullable(t.String()),
  error: t.Nullable(t.String()),
})

export const taskRunsResponseSchema = t.Object({
  runs: t.Array(taskRunSchema),
})

export const notFoundSchema = t.Object({
  error: t.Literal('not_found'),
})

export const badRequestSchema = t.Object({
  error: t.String(),
})

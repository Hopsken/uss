import { randomUUID } from 'node:crypto'
import { and, asc, desc, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm'
import type { TaskLastRunStatus, TaskRun, TaskSchedule, TaskStatus, TaskTemplate } from '@uss/shared'
import { db, schema } from '../../infra/db/client.js'

type TaskRow = typeof schema.tasks.$inferSelect

type TaskInsert = typeof schema.tasks.$inferInsert

export type LocalTaskRecord = {
  id: string
  title: string
  instructionsBase: string
  agentId: string
  status: TaskStatus
  schedule: TaskSchedule
  templateId: string | null
  nextRunAtUtc: number | null
  lastRunAtUtc: number | null
  lastRunStatus: TaskLastRunStatus
  lastRunError: string | null
  lockOwner: string | null
  lockUntilUtc: number | null
  createdAt: number
  updatedAt: number
  cancelledAt: number | null
}

export type LocalTaskRunRecord = {
  id: string
  taskId: string
  trigger: 'schedule' | 'manual'
  status: 'running' | 'success' | 'failed' | 'timeout'
  startedAtUtc: number
  endedAtUtc: number | null
  openclawRunId: string | null
  executionLogText: string | null
  errorMessage: string | null
  idempotencyKey: string
}

export type TasksLocalRepository = {
  ensureTables: () => Promise<void>
  listTasks: (agentId?: string) => Promise<LocalTaskRecord[]>
  getTaskById: (taskId: string) => Promise<LocalTaskRecord | null>
  createTask: (params: {
    title: string
    instructionsBase: string
    agentId: string
    status: TaskStatus
    schedule: TaskSchedule
    templateId: string | null
    nextRunAtUtc: number | null
  }) => Promise<LocalTaskRecord>
  updateTask: (taskId: string, changes: Partial<Pick<LocalTaskRecord, 'title' | 'instructionsBase' | 'agentId' | 'status' | 'schedule' | 'templateId' | 'nextRunAtUtc' | 'lastRunAtUtc' | 'lastRunStatus' | 'lastRunError' | 'lockOwner' | 'lockUntilUtc' | 'cancelledAt'>>) => Promise<LocalTaskRecord | null>
  listDueTaskIds: (nowMs: number, limit: number) => Promise<string[]>
  tryClaimTask: (taskId: string, owner: string, lockUntilUtc: number, nowMs: number) => Promise<boolean>
  createRun: (params: {
    taskId: string
    trigger: 'schedule' | 'manual'
    status: 'running' | 'success' | 'failed' | 'timeout'
    startedAtUtc: number
    endedAtUtc: number | null
    openclawRunId: string | null
    executionLogText: string | null
    errorMessage: string | null
    idempotencyKey: string
  }) => Promise<LocalTaskRunRecord>
  updateRun: (runId: string, changes: Partial<Omit<LocalTaskRunRecord, 'id' | 'taskId' | 'trigger' | 'startedAtUtc' | 'idempotencyKey'>>) => Promise<LocalTaskRunRecord | null>
  listRuns: (taskId: string) => Promise<LocalTaskRunRecord[]>
  getLatestRunsByTaskIds: (taskIds: string[]) => Promise<Map<string, LocalTaskRunRecord>>
  insertChangelog: (params: {
    taskId: string
    type: 'task_created' | 'status_changed' | 'agent_assigned' | 'task_updated' | 'run_triggered'
    message: string
    detail: string
    occurredAtUtc: number
  }) => Promise<void>
  listChangelogByTaskIds: (taskIds: string[]) => Promise<Map<string, Array<{ id: string; taskId: string; type: string; message: string; detail: string; occurredAtUtc: number }>>>
  listTemplates: () => Promise<TaskTemplate[]>
  createTemplate: (template: Omit<TaskTemplate, 'id'>) => Promise<TaskTemplate>
  updateTemplate: (templateId: string, changes: Partial<Omit<TaskTemplate, 'id'>>) => Promise<TaskTemplate | null>
  deleteTemplate: (templateId: string) => Promise<boolean>
}

let ensureTablesPromise: Promise<void> | null = null

function parseSchedule(scheduleJson: string): TaskSchedule {
  try {
    return JSON.parse(scheduleJson) as TaskSchedule
  } catch {
    return {
      type: 'one_time',
      humanReadable: 'Unknown',
    }
  }
}

function toTaskRecord(row: TaskRow): LocalTaskRecord {
  return {
    id: row.id,
    title: row.title,
    instructionsBase: row.instructionsBase,
    agentId: row.agentId,
    status: row.status as TaskStatus,
    schedule: parseSchedule(row.scheduleJson),
    templateId: row.templateId ?? null,
    nextRunAtUtc: row.nextRunAtUtc ? row.nextRunAtUtc.getTime() : null,
    lastRunAtUtc: row.lastRunAtUtc ? row.lastRunAtUtc.getTime() : null,
    lastRunStatus: row.lastRunStatus as TaskLastRunStatus,
    lastRunError: row.lastRunError ?? null,
    lockOwner: row.lockOwner ?? null,
    lockUntilUtc: row.lockUntilUtc ? row.lockUntilUtc.getTime() : null,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    cancelledAt: row.cancelledAt ? row.cancelledAt.getTime() : null,
  }
}

function toRunRecord(row: typeof schema.taskRuns.$inferSelect): LocalTaskRunRecord {
  return {
    id: row.id,
    taskId: row.taskId,
    trigger: row.trigger as 'schedule' | 'manual',
    status: row.status as 'running' | 'success' | 'failed' | 'timeout',
    startedAtUtc: row.startedAtUtc.getTime(),
    endedAtUtc: row.endedAtUtc ? row.endedAtUtc.getTime() : null,
    openclawRunId: row.openclawRunId ?? null,
    executionLogText: row.executionLogText ?? null,
    errorMessage: row.errorMessage ?? null,
    idempotencyKey: row.idempotencyKey,
  }
}

async function ensureTables() {
  if (ensureTablesPromise) return ensureTablesPromise

  ensureTablesPromise = (async () => {
    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        instructions_base TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        status TEXT NOT NULL,
        schedule_json TEXT NOT NULL,
        template_id TEXT,
        next_run_at_utc INTEGER,
        last_run_at_utc INTEGER,
        last_run_status TEXT NOT NULL,
        last_run_error TEXT,
        lock_owner TEXT,
        lock_until_utc INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        cancelled_at INTEGER
      );
    `),
    )

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS task_runs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        trigger TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at_utc INTEGER NOT NULL,
        ended_at_utc INTEGER,
        openclaw_run_id TEXT,
        execution_log_text TEXT,
        error_message TEXT,
        idempotency_key TEXT NOT NULL UNIQUE
      );
    `),
    )

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS task_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        default_instructions TEXT NOT NULL,
        suggested_agent_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `),
    )

    await db.run(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS task_changelog (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        detail TEXT NOT NULL,
        occurred_at_utc INTEGER NOT NULL
      );
    `),
    )

    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS idx_tasks_next_run ON tasks(next_run_at_utc);'))
    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS idx_task_runs_task ON task_runs(task_id, started_at_utc DESC);'))
    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS idx_task_changelog_task ON task_changelog(task_id, occurred_at_utc DESC);'))
  })()

  return ensureTablesPromise
}

export const tasksLocalRepository: TasksLocalRepository = {
  ensureTables,

  async listTasks(agentId) {
    await ensureTables()
    const where = agentId ? eq(schema.tasks.agentId, agentId) : undefined
    const rows = await db.select().from(schema.tasks).where(where).orderBy(desc(schema.tasks.updatedAt))
    return rows.map(toTaskRecord)
  },

  async getTaskById(taskId) {
    await ensureTables()
    const rows = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1)
    const row = rows.at(0)
    return row ? toTaskRecord(row) : null
  },

  async createTask(params) {
    await ensureTables()
    const now = new Date()
    const row: TaskInsert = {
      id: randomUUID(),
      title: params.title,
      instructionsBase: params.instructionsBase,
      agentId: params.agentId,
      status: params.status,
      scheduleJson: JSON.stringify(params.schedule),
      templateId: params.templateId,
      nextRunAtUtc: params.nextRunAtUtc ? new Date(params.nextRunAtUtc) : null,
      lastRunAtUtc: null,
      lastRunStatus: 'never',
      lastRunError: null,
      lockOwner: null,
      lockUntilUtc: null,
      createdAt: now,
      updatedAt: now,
      cancelledAt: null,
    }

    await db.insert(schema.tasks).values(row)
    return (await this.getTaskById(row.id)) as LocalTaskRecord
  },

  async updateTask(taskId, changes) {
    await ensureTables()
    const values: Partial<typeof schema.tasks.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (changes.title !== undefined) values.title = changes.title
    if (changes.instructionsBase !== undefined) values.instructionsBase = changes.instructionsBase
    if (changes.agentId !== undefined) values.agentId = changes.agentId
    if (changes.status !== undefined) values.status = changes.status
    if (changes.schedule !== undefined) values.scheduleJson = JSON.stringify(changes.schedule)
    if (changes.templateId !== undefined) values.templateId = changes.templateId
    if (changes.nextRunAtUtc !== undefined) values.nextRunAtUtc = changes.nextRunAtUtc ? new Date(changes.nextRunAtUtc) : null
    if (changes.lastRunAtUtc !== undefined) values.lastRunAtUtc = changes.lastRunAtUtc ? new Date(changes.lastRunAtUtc) : null
    if (changes.lastRunStatus !== undefined) values.lastRunStatus = changes.lastRunStatus
    if (changes.lastRunError !== undefined) values.lastRunError = changes.lastRunError
    if (changes.lockOwner !== undefined) values.lockOwner = changes.lockOwner
    if (changes.lockUntilUtc !== undefined) values.lockUntilUtc = changes.lockUntilUtc ? new Date(changes.lockUntilUtc) : null
    if (changes.cancelledAt !== undefined) values.cancelledAt = changes.cancelledAt ? new Date(changes.cancelledAt) : null

    await db.update(schema.tasks).set(values).where(eq(schema.tasks.id, taskId))
    return await this.getTaskById(taskId)
  },

  async listDueTaskIds(nowMs, limit) {
    await ensureTables()
    const rows = await db
      .select({ id: schema.tasks.id })
      .from(schema.tasks)
      .where(
        and(
          eq(schema.tasks.status, 'pending'),
          lte(schema.tasks.nextRunAtUtc, new Date(nowMs)),
          or(isNull(schema.tasks.lockUntilUtc), lte(schema.tasks.lockUntilUtc, new Date(nowMs))),
        ),
      )
      .orderBy(asc(schema.tasks.nextRunAtUtc))
      .limit(limit)

    return rows.map((row) => row.id)
  },

  async tryClaimTask(taskId, owner, lockUntilUtc, nowMs) {
    await ensureTables()
    const result = await db
      .update(schema.tasks)
      .set({
        lockOwner: owner,
        lockUntilUtc: new Date(lockUntilUtc),
        updatedAt: new Date(nowMs),
      })
      .where(
        and(
          eq(schema.tasks.id, taskId),
          eq(schema.tasks.status, 'pending'),
          or(isNull(schema.tasks.lockUntilUtc), lte(schema.tasks.lockUntilUtc, new Date(nowMs))),
        ),
      )

    return Number(result.rowsAffected ?? 0) > 0
  },

  async createRun(params) {
    await ensureTables()
    const id = randomUUID()
    await db.insert(schema.taskRuns).values({
      id,
      taskId: params.taskId,
      trigger: params.trigger,
      status: params.status,
      startedAtUtc: new Date(params.startedAtUtc),
      endedAtUtc: params.endedAtUtc ? new Date(params.endedAtUtc) : null,
      openclawRunId: params.openclawRunId,
      executionLogText: params.executionLogText,
      errorMessage: params.errorMessage,
      idempotencyKey: params.idempotencyKey,
    })

    const rows = await db.select().from(schema.taskRuns).where(eq(schema.taskRuns.id, id)).limit(1)
    return toRunRecord(rows[0]!)
  },

  async updateRun(runId, changes) {
    await ensureTables()
    const values: Partial<typeof schema.taskRuns.$inferInsert> = {}
    if (changes.status !== undefined) values.status = changes.status
    if (changes.endedAtUtc !== undefined) values.endedAtUtc = changes.endedAtUtc ? new Date(changes.endedAtUtc) : null
    if (changes.openclawRunId !== undefined) values.openclawRunId = changes.openclawRunId
    if (changes.executionLogText !== undefined) values.executionLogText = changes.executionLogText
    if (changes.errorMessage !== undefined) values.errorMessage = changes.errorMessage

    await db.update(schema.taskRuns).set(values).where(eq(schema.taskRuns.id, runId))
    const rows = await db.select().from(schema.taskRuns).where(eq(schema.taskRuns.id, runId)).limit(1)
    const row = rows.at(0)
    return row ? toRunRecord(row) : null
  },

  async listRuns(taskId) {
    await ensureTables()
    const rows = await db
      .select()
      .from(schema.taskRuns)
      .where(eq(schema.taskRuns.taskId, taskId))
      .orderBy(desc(schema.taskRuns.startedAtUtc))
      .limit(100)
    return rows.map(toRunRecord)
  },

  async getLatestRunsByTaskIds(taskIds) {
    await ensureTables()
    const map = new Map<string, LocalTaskRunRecord>()
    if (taskIds.length === 0) return map

    const rows = await db
      .select()
      .from(schema.taskRuns)
      .where(inArray(schema.taskRuns.taskId, taskIds))
      .orderBy(desc(schema.taskRuns.startedAtUtc))

    for (const row of rows) {
      if (!map.has(row.taskId)) {
        map.set(row.taskId, toRunRecord(row))
      }
    }

    return map
  },

  async insertChangelog(params) {
    await ensureTables()
    await db.insert(schema.taskChangelog).values({
      id: randomUUID(),
      taskId: params.taskId,
      type: params.type,
      message: params.message,
      detail: params.detail,
      occurredAtUtc: new Date(params.occurredAtUtc),
    })
  },

  async listChangelogByTaskIds(taskIds) {
    await ensureTables()
    const map = new Map<string, Array<{ id: string; taskId: string; type: string; message: string; detail: string; occurredAtUtc: number }>>()
    if (taskIds.length === 0) return map

    const rows = await db
      .select()
      .from(schema.taskChangelog)
      .where(inArray(schema.taskChangelog.taskId, taskIds))
      .orderBy(desc(schema.taskChangelog.occurredAtUtc))

    for (const row of rows) {
      const arr = map.get(row.taskId) ?? []
      arr.push({
        id: row.id,
        taskId: row.taskId,
        type: row.type,
        message: row.message,
        detail: row.detail,
        occurredAtUtc: row.occurredAtUtc.getTime(),
      })
      map.set(row.taskId, arr)
    }

    return map
  },

  async listTemplates() {
    await ensureTables()
    const rows = await db.select().from(schema.taskTemplates).orderBy(asc(schema.taskTemplates.name))
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      defaultInstructions: row.defaultInstructions,
      suggestedAgentId: row.suggestedAgentId ?? undefined,
    }))
  },

  async createTemplate(template) {
    await ensureTables()
    const now = new Date()
    const id = randomUUID()
    await db.insert(schema.taskTemplates).values({
      id,
      name: template.name,
      description: template.description,
      defaultInstructions: template.defaultInstructions,
      suggestedAgentId: template.suggestedAgentId,
      createdAt: now,
      updatedAt: now,
    })

    return {
      id,
      ...template,
    }
  },

  async updateTemplate(templateId, changes) {
    await ensureTables()

    await db
      .update(schema.taskTemplates)
      .set({
        name: changes.name,
        description: changes.description,
        defaultInstructions: changes.defaultInstructions,
        suggestedAgentId: changes.suggestedAgentId,
        updatedAt: new Date(),
      })
      .where(eq(schema.taskTemplates.id, templateId))

    const rows = await db.select().from(schema.taskTemplates).where(eq(schema.taskTemplates.id, templateId)).limit(1)
    const row = rows.at(0)
    if (!row) return null

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      defaultInstructions: row.defaultInstructions,
      suggestedAgentId: row.suggestedAgentId ?? undefined,
    }
  },

  async deleteTemplate(templateId) {
    await ensureTables()
    const result = await db.delete(schema.taskTemplates).where(eq(schema.taskTemplates.id, templateId))
    return Number(result.rowsAffected ?? 0) > 0
  },
}

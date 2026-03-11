import type {
  AgendaBucket,
  AgendaState,
  AutomationStatus,
  ChangelogEntry,
  Task,
  TaskRun,
  TaskStatus,
} from '@uss/shared'
import type { LocalTaskRecord, LocalTaskRunRecord } from './tasks.local.repository.js'

function toIso(ms: number | null): string | null {
  if (!ms) return null
  return new Date(ms).toISOString()
}

function completedAt(task: LocalTaskRecord): string | null {
  if (task.status !== 'done' || !task.lastRunAtUtc) return null
  return new Date(task.lastRunAtUtc).toISOString()
}

function toTaskTime(task: LocalTaskRecord): number | null {
  if (task.nextRunAtUtc) return task.nextRunAtUtc
  if (task.schedule.type === 'one_time' && task.schedule.scheduledAt) {
    const parsed = Date.parse(task.schedule.scheduledAt)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function startOfUtcDay(ms: number): number {
  const date = new Date(ms)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function deriveAutomationStatus(task: LocalTaskRecord, nowMs: number): AutomationStatus | undefined {
  if (task.schedule.type !== 'recurring') return undefined
  if (task.status === 'archived') return undefined
  if (task.status === 'cancelled') return 'paused'
  if (task.status === 'running' || task.lastRunStatus === 'running') return 'running'
  if (task.status === 'failed' || task.lastRunStatus === 'failed' || task.lastRunStatus === 'timeout') return 'attention'
  if (!task.nextRunAtUtc) return 'attention'
  if (task.nextRunAtUtc <= nowMs) return 'attention'
  if (task.nextRunAtUtc <= nowMs + 24 * 60 * 60 * 1000) return 'due_soon'
  return 'healthy'
}

function deriveAgendaState(task: LocalTaskRecord): AgendaState | undefined {
  if (task.schedule.type !== 'one_time') return undefined
  if (task.status === 'archived') return undefined
  if (task.status === 'running') return 'in_progress'
  if (task.status === 'failed') return 'blocked'
  if (task.status === 'done') return 'done'
  if (task.status === 'cancelled') return 'cancelled'
  return 'queued'
}

function deriveAgendaBucket(task: LocalTaskRecord, nowMs: number): AgendaBucket | undefined {
  if (task.schedule.type !== 'one_time') return undefined
  if (task.status === 'archived') return undefined
  if (task.status === 'done') return 'completed'
  if (task.status === 'cancelled') return 'cancelled'

  const taskTime = toTaskTime(task)
  if (!taskTime) return 'today'

  if (taskTime < nowMs) return 'overdue'

  const nowDay = startOfUtcDay(nowMs)
  const taskDay = startOfUtcDay(taskTime)
  return taskDay === nowDay ? 'today' : 'upcoming'
}

export function mapTask(params: {
  task: LocalTaskRecord
  agentById: Map<string, { id: string; name: string; role: string }>
  changelog: ChangelogEntry[]
  latestRun: LocalTaskRunRecord | null
}): Task {
  const agent = params.agentById.get(params.task.agentId)
  const nowMs = Date.now()
  return {
    id: params.task.id,
    title: params.task.title,
    instructions: params.task.instructionsBase,
    agentId: params.task.agentId,
    agentName: agent?.name ?? params.task.agentId,
    agentRole: agent?.role ?? 'Agent',
    status: params.task.status,
    schedule: params.task.schedule,
    createdAt: new Date(params.task.createdAt).toISOString(),
    updatedAt: new Date(params.task.updatedAt).toISOString(),
    completedAt: completedAt(params.task),
    nextRunAt: toIso(params.task.nextRunAtUtc),
    templateId: params.task.templateId,
    changelog: params.changelog,
    executionLog: params.latestRun?.executionLogText ?? null,
    lastRunStatus: params.task.lastRunStatus,
    lastRunAt: toIso(params.task.lastRunAtUtc),
    lastRunError: params.task.lastRunError,
    automationStatus: deriveAutomationStatus(params.task, nowMs),
    agendaBucket: deriveAgendaBucket(params.task, nowMs),
    agendaState: deriveAgendaState(params.task),
  }
}

export function mapChangelog(rows: Array<{ id: string; type: string; message: string; detail: string; occurredAtUtc: number }>): ChangelogEntry[] {
  return rows.map((row) => ({
    id: row.id,
    type: row.type as ChangelogEntry['type'],
    message: row.message,
    detail: row.detail,
    occurredAt: new Date(row.occurredAtUtc).toISOString(),
  }))
}

export function mapRun(run: LocalTaskRunRecord): TaskRun {
  return {
    id: run.id,
    taskId: run.taskId,
    trigger: run.trigger,
    status: run.status,
    startedAt: new Date(run.startedAtUtc).toISOString(),
    endedAt: run.endedAtUtc ? new Date(run.endedAtUtc).toISOString() : null,
    executionLog: run.executionLogText,
    error: run.errorMessage,
  }
}

export function nextStatusAfterSuccess(current: LocalTaskRecord): TaskStatus {
  if (current.schedule.type === 'recurring') return 'pending'
  return 'done'
}

export function computeNextRunAtUtc(params: { schedule: LocalTaskRecord['schedule']; fromMs: number }): number | null {
  const { schedule, fromMs } = params

  if (schedule.type === 'one_time') {
    if (!schedule.scheduledAt) return fromMs
    const ts = Date.parse(schedule.scheduledAt)
    return Number.isFinite(ts) ? ts : fromMs
  }

  const preset = schedule.preset ?? 'daily'
  if (preset === 'hourly') return fromMs + 60 * 60 * 1000
  if (preset === 'daily') return fromMs + 24 * 60 * 60 * 1000
  if (preset === 'weekly') return fromMs + 7 * 24 * 60 * 60 * 1000
  if (preset === 'monthly') return fromMs + 30 * 24 * 60 * 60 * 1000

  return fromMs + 24 * 60 * 60 * 1000
}

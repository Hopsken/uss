import type { AgendaBucket, AgendaState, AutomationStatus, Task, TaskStatus } from './types'

export const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  cancelled: 'Cancelled',
  archived: 'Archived',
}

export const automationTone: Record<AutomationStatus, string> = {
  running: 'border-sky-200 bg-sky-50 text-sky-700',
  attention: 'border-red-200 bg-red-50 text-red-700',
  due_soon: 'border-amber-200 bg-amber-50 text-amber-700',
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  paused: 'border-slate-200 bg-slate-100 text-slate-600',
}

export const agendaStateTone: Record<AgendaState, string> = {
  queued: 'border-slate-200 bg-slate-100 text-slate-700',
  in_progress: 'border-sky-200 bg-sky-50 text-sky-700',
  blocked: 'border-red-200 bg-red-50 text-red-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500',
}

export const automationLabels: Record<AutomationStatus, string> = {
  running: 'Running',
  attention: 'Attention',
  due_soon: 'Due Soon',
  healthy: 'Healthy',
  paused: 'Paused',
}

export const agendaBucketLabels: Record<AgendaBucket, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const agendaStateLabels: Record<AgendaState, string> = {
  queued: 'Queued',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDueLabel(task: Task): string {
  return task.nextRunAt ? formatShortDate(task.nextRunAt) : task.schedule.humanReadable
}

export function countAutomation(tasks: Task[], status: AutomationStatus): number {
  return tasks.filter((task) => task.automationStatus === status).length
}

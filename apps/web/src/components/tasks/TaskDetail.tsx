import { useState } from 'react'
import { Calendar, Clock, CheckCircle2, ChevronDown, Copy, ChevronRight, Trash2, Archive, Play } from 'lucide-react'
import type { Task, AgentRef, TaskStatus, ChangelogEntryType } from './types'
import { agendaBucketLabels, agendaStateLabels, automationLabels, formatShortDate } from './presentation'

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-400', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  running: { label: 'Running', dot: 'bg-sky-400 animate-pulse', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800' },
  done: { label: 'Done', dot: 'bg-emerald-400', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  failed: { label: 'Failed', dot: 'bg-red-400', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  cancelled: { label: 'Cancelled', dot: 'bg-slate-400', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
  archived: { label: 'Archived', dot: 'bg-violet-400', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
}

const CHANGELOG_DOT: Record<ChangelogEntryType, string> = {
  task_created: 'bg-slate-400',
  status_changed: 'bg-sky-400',
  agent_assigned: 'bg-violet-400',
  task_updated: 'bg-amber-400',
  run_triggered: 'bg-emerald-400',
}

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface TaskDetailProps {
  task: Task
  agents: AgentRef[]
  onBack?: () => void
  onDelete?: (taskId: string) => void
  onArchive?: (taskId: string) => void
  onRestore?: (taskId: string) => void
  onRunNow?: (taskId: string) => void
  onChangeStatus?: (taskId: string, status: TaskStatus) => void
  onReassignTask?: (taskId: string, agentId: string) => void
}

export function TaskDetail({ task, agents, onDelete, onArchive, onRestore, onRunNow, onChangeStatus, onReassignTask }: TaskDetailProps) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [logsExpanded, setLogsExpanded] = useState(true)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const statusCfg = STATUS_CONFIG[task.status]
  const isRunning = task.status === 'running'
  const isArchived = task.status === 'archived'
  const allStatuses: TaskStatus[] = isArchived
    ? ['pending']
    : task.schedule.type === 'one_time'
      ? ['pending', 'done', 'cancelled']
      : ['pending', 'cancelled']
  const canRunNow = task.status === 'pending' || task.status === 'failed'
  const archiveLabel = isArchived ? 'Restore' : 'Archive'

  function handleCopy() {
    if (task.executionLog) {
      navigator.clipboard.writeText(task.executionLog)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    onDelete?.(task.id)
    setConfirmDelete(false)
  }

  function handleArchive() {
    if (isArchived) {
      onRestore?.(task.id)
      return
    }

    onArchive?.(task.id)
  }

  const statusDropdown = (compact = false) => (
    <div className="relative">
      <button
        onClick={() => { setStatusOpen(!statusOpen); setAssignOpen(false) }}
        className={compact
          ? `flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`
          : `w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
        <ChevronDown className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} opacity-50 shrink-0`} />
      </button>
      {statusOpen && (
        <div className={`absolute ${compact ? 'right-0' : 'left-0 right-0'} top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden`}>
          {allStatuses.map((s) => {
            const scfg = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => { onChangeStatus?.(task.id, s); setStatusOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${scfg.color} ${task.status === s ? 'font-medium' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${scfg.dot}`} />
                {scfg.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  const assignDropdown = (compact = false) => (
    <div className="relative">
      <button
        onClick={() => { setAssignOpen(!assignOpen); setStatusOpen(false) }}
        className={compact
          ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          : 'w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://robohash.org/${task.agentId}?set=set1&size=24x24`}
            alt={task.agentName}
            className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"
          />
          {!compact && (
            <div className="text-left min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{task.agentName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{task.agentRole}</p>
            </div>
          )}
          {compact && <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{task.agentName}</span>}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0 ml-1" />
      </button>
      {assignOpen && (
        <div className={`absolute ${compact ? 'right-0' : 'left-0 right-0'} top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden`}>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => { onReassignTask?.(task.id, agent.id); setAssignOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${task.agentId === agent.id ? 'bg-sky-50/80 dark:bg-sky-900/20' : ''}`}
            >
              <img src={`https://robohash.org/${agent.id}?set=set1&size=24x24`} alt={agent.name} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{agent.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{agent.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const mainContent = (mobile = false) => (
    <div className="flex-1 min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950/30">
      <div className={`${mobile ? 'px-4 py-5' : 'max-w-2xl mx-auto px-8 py-6'}`}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-tight mb-1">{task.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-sm text-slate-400 dark:text-slate-500 font-mono">{task.schedule.humanReadable}</p>
          {task.schedule.type === 'recurring' && task.automationStatus ? (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
              {automationLabels[task.automationStatus]}
            </span>
          ) : null}
          {task.schedule.type === 'one_time' && task.agendaState ? (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
              {agendaStateLabels[task.agendaState]}
            </span>
          ) : null}
          {task.schedule.type === 'one_time' && task.agendaBucket ? (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {agendaBucketLabels[task.agendaBucket]}
            </span>
          ) : null}
        </div>

        {mobile && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {assignDropdown(true)}
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{task.schedule.humanReadable}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(task.createdAt)}</span>
              {task.completedAt && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" />{formatDate(task.completedAt)}</span>}
            </div>
          </div>
        )}

        {canRunNow && (
          <button
            onClick={() => onRunNow?.(task.id)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors mb-5"
          >
            <Play className="w-3.5 h-3.5" />
            Run now
          </button>
        )}

        <section className="mb-7">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Instructions</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{task.instructions}</pre>
          </div>
        </section>

        <section className="mb-7">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Activity</h2>
          <div>
            {task.changelog.map((entry, i) => {
              const dotColor = CHANGELOG_DOT[entry.type] ?? 'bg-slate-400'
              const isLast = i === task.changelog.length - 1
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                    {!isLast && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 my-1" />}
                  </div>
                  <div className={isLast ? '' : 'pb-4'}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{entry.message}</p>
                      <span className="text-xs text-slate-400 tabular-nums">{relativeTime(entry.occurredAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{entry.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {task.executionLog && (
          <section className="mb-7">
            <button
              onClick={() => setLogsExpanded(!logsExpanded)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${logsExpanded ? 'rotate-90' : ''}`} />
              Execution Logs
            </button>
            {logsExpanded && (
              <div className="rounded-xl overflow-hidden border border-slate-700 dark:border-slate-800">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 opacity-50" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-50" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-50" />
                  </div>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 dark:bg-slate-950 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre">
                  {task.executionLog}
                </pre>
              </div>
            )}
          </section>
        )}

        {mobile && (
          <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              onClick={handleDelete}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Trash2 className="w-3.5 h-3.5" /> {confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
            <button
              onClick={handleArchive}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Archive className="w-3.5 h-3.5" /> {archiveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-full min-h-0">
      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col w-full min-w-0">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <img
            src={`https://robohash.org/${task.agentId}?set=set1&size=32x32`}
            alt={task.agentName}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">{task.agentName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.agentRole}</p>
          </div>
          {statusDropdown(true)}
        </div>
        {mainContent(true)}
      </div>

      {/* ── Desktop ─────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900/50">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center text-center mb-6 pt-2">
            <img
              src={`https://robohash.org/${task.agentId}?set=set1&size=112x112`}
              alt={task.agentName}
              className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3 ring-4 ring-slate-100 dark:ring-slate-800"
            />
            <p className="font-semibold text-slate-900 dark:text-slate-100">{task.agentName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.agentRole}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Status</p>
            {statusDropdown(false)}
          </div>
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Assigned To</p>
            {assignDropdown(false)}
          </div>
          <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">
                  {task.schedule.type === 'recurring' ? 'Cadence' : 'Scheduled For'}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-snug">{task.schedule.humanReadable}</p>
              </div>
            </div>
            {task.nextRunAt && (
              <div className="flex items-start gap-2.5">
                <Play className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">
                    {task.schedule.type === 'recurring' ? 'Next run' : 'Due'}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{formatShortDate(task.nextRunAt)}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">Created</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{formatDate(task.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">Completed</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{formatDate(task.completedAt)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <button
            onClick={handleDelete}
            disabled={isRunning}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <Trash2 className="w-3.5 h-3.5" /> {confirmDelete ? 'Confirm delete' : 'Delete'}
          </button>
          <button
            onClick={handleArchive}
            disabled={isRunning}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <Archive className="w-3.5 h-3.5" /> {archiveLabel}
          </button>
        </div>
      </div>
      <div className="hidden md:flex flex-1 min-w-0">{mainContent(false)}</div>
    </div>
  )
}

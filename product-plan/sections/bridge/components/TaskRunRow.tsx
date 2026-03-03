import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import type { RecentTaskRun } from '../types'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const STATUS_CONFIG = {
  running: {
    icon: <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />,
    badge: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400',
  },
  completed: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400',
  },
  failed: {
    icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    badge: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400',
  },
  scheduled: {
    icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
  },
}

interface TaskRunRowProps {
  run: RecentTaskRun
  isLast: boolean
  onClick?: () => void
}

export function TaskRunRow({ run, isLast, onClick }: TaskRunRowProps) {
  const st = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.scheduled

  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
        !isLast ? 'border-b border-slate-100 dark:border-slate-800/80' : '',
      ].join(' ')}
    >
      <span className="shrink-0">{st.icon}</span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm text-slate-800 dark:text-slate-200 truncate">
          {run.taskName}
        </span>
        {run.error && (
          <span className="block text-xs text-red-500 dark:text-red-400 truncate mt-0.5">
            {run.error}
          </span>
        )}
      </span>

      <span
        className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded ${st.badge}`}
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        {run.agentName}
      </span>

      <span
        className="shrink-0 text-xs text-slate-400 dark:text-slate-500 min-w-[3.5rem] text-right"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {relativeTime(run.startedAt)}
      </span>
    </button>
  )
}

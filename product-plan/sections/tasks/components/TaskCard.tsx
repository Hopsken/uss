import type { Task, TaskStatus } from '../types'
import { Clock } from 'lucide-react'

const STATUS_DOT: Record<TaskStatus, string> = {
  pending: 'bg-amber-400',
  running: 'bg-sky-400 animate-pulse',
  done: 'bg-emerald-400',
  failed: 'bg-red-400',
  cancelled: 'bg-slate-400',
}

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const dot = STATUS_DOT[task.status]

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-700/90 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden group"
    >
      <div className="px-3 pt-3 pb-3">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {task.title}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <img
                src={`https://robohash.org/${task.agentId}?set=set1&size=24x24`}
                alt={task.agentName}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 ring-1 ring-white dark:ring-slate-700"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-700 ${dot}`} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{task.agentName}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="text-xs font-mono tabular-nums truncate max-w-[7rem]">
              {task.schedule.humanReadable}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

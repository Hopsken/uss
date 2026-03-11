'use client'

import { useState } from 'react'
import { ArchiveRestore, Clock3, Trash2 } from 'lucide-react'
import type { Task } from './types'
import { EmptySurfaceState } from './TasksPageChrome'
import { formatShortDate } from './presentation'

export function ArchivedTasksPanel({
  tasks,
  busy,
  onSelectTask,
  onRestoreTask,
  onDeleteTask,
}: {
  tasks: Task[]
  busy: boolean
  onSelectTask: (taskId: string) => void
  onRestoreTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (tasks.length === 0) {
    return (
      <div className="p-5">
        <EmptySurfaceState
          title="No archived tasks"
          description="Archive is empty. Old work lands here until you restore it or delete it permanently."
        />
      </div>
    )
  }

  return (
    <div className="grid gap-3 p-5">
      {tasks.map((task) => (
        <article
          key={task.id}
          className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#fcfcff_0%,#f8fafc_55%,#f3e8ff_100%)] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.45)]"
        >
          <div className="flex items-start justify-between gap-3">
            <button onClick={() => onSelectTask(task.id)} className="min-w-0 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-500">Archived</div>
              <h3 className="mt-2 text-sm font-semibold text-slate-950">{task.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{task.agentName}</span>
                <span className="rounded-full border border-violet-200 bg-white/80 px-2 py-1 font-medium text-violet-700">
                  {task.schedule.type === 'recurring' ? 'Automation' : 'Agenda'}
                </span>
              </div>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{formatShortDate(task.updatedAt)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onRestoreTask(task.id)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArchiveRestore className="h-3.5 w-3.5" />
              Restore
            </button>
            <button
              onClick={() => {
                if (confirmDeleteId === task.id) {
                  onDeleteTask(task.id)
                  setConfirmDeleteId(null)
                  return
                }

                setConfirmDeleteId(task.id)
              }}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDeleteId === task.id ? 'Confirm delete' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

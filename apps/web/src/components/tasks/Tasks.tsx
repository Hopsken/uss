import { useState } from 'react'
import type { ReactNode } from 'react'
import { X, Columns, FileText } from 'lucide-react'
import type { TasksProps } from './types'
import { TaskBoard } from './TaskBoard'
import { TaskDetail } from './TaskDetail'
import { CreateTaskModal } from './CreateTaskModal'
import { TemplatesList } from './TemplatesList'

type Section = 'board' | 'templates'

export function Tasks({
  tasks,
  templates,
  agents,
  kanbanView,
  selectedTaskId,
  onKanbanViewChange,
  onSelectTask,
  onCloseTask,
  onCreateTask,
  onDeleteTask,
  onRunNow,
  onChangeStatus,
  onReassignTask,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: TasksProps) {
  const [section, setSection] = useState<Section>('board')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null

  function switchSection(s: Section) {
    setSection(s)
    if (s !== 'board' && selectedTaskId) onCloseTask?.()
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Top tab bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <TabButton
          icon={<Columns className="w-4 h-4" />}
          label="Board"
          active={section === 'board'}
          onClick={() => switchSection('board')}
        />
        <TabButton
          icon={<FileText className="w-4 h-4" />}
          label="Templates"
          count={templates.length}
          active={section === 'templates'}
          onClick={() => switchSection('templates')}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {section === 'board' ? (
          <TaskBoard
            tasks={tasks}
            agents={agents}
            kanbanView={kanbanView}
            onKanbanViewChange={onKanbanViewChange}
            onSelectTask={onSelectTask}
            onCreateTask={() => setCreateModalOpen(true)}
          />
        ) : (
          <TemplatesList
            templates={templates}
            agents={agents}
            onCreate={onCreateTemplate}
            onUpdate={onUpdateTemplate}
            onDelete={onDeleteTemplate}
          />
        )}
      </div>

      {/* ── Task detail — bottom sheet (mobile) / modal (desktop) ── */}
      {selectedTask && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center md:p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseTask} />
          <div className="relative w-full md:max-w-4xl
                          h-[92dvh] md:h-full md:max-h-[88vh]
                          bg-white dark:bg-slate-900
                          rounded-t-2xl md:rounded-2xl
                          shadow-2xl border border-slate-200 dark:border-slate-700
                          flex flex-col overflow-hidden">
            <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <button
              onClick={onCloseTask}
              className="hidden md:flex absolute top-3 right-3 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <TaskDetail
              task={selectedTask}
              agents={agents}
              onBack={onCloseTask}
              onDelete={(id) => { onDeleteTask?.(id); onCloseTask?.() }}
              onRunNow={onRunNow}
              onChangeStatus={onChangeStatus}
              onReassignTask={onReassignTask}
            />
          </div>
        </div>
      )}

      {/* Create task modal */}
      {createModalOpen && (
        <CreateTaskModal
          agents={agents}
          templates={templates}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={(task) => {
            onCreateTask?.(task)
            setCreateModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

// ── Tab button ──────────────────────────────────────────────────────────────

function TabButton({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        active
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={`text-xs tabular-nums rounded-full px-1.5 py-0.5 leading-none ${
          active
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

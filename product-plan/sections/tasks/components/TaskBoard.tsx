import { useState, useEffect } from 'react'
import { Plus, Settings } from 'lucide-react'
import type { Task, AgentRef, KanbanView, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

const STATUS_COLUMNS: Array<{ status: TaskStatus; label: string; accentColor: string }> = [
  { status: 'pending', label: 'Pending', accentColor: 'bg-amber-400' },
  { status: 'running', label: 'Running', accentColor: 'bg-sky-400' },
  { status: 'done', label: 'Done', accentColor: 'bg-emerald-400' },
  { status: 'failed', label: 'Failed', accentColor: 'bg-red-400' },
]

interface TaskBoardProps {
  tasks: Task[]
  agents: AgentRef[]
  kanbanView: KanbanView
  onKanbanViewChange?: (view: KanbanView) => void
  onSelectTask?: (taskId: string) => void
  onCreateTask?: () => void
  onPreInstructions?: (agentId: string) => void
}

export function TaskBoard({
  tasks,
  agents,
  kanbanView,
  onKanbanViewChange,
  onSelectTask,
  onCreateTask,
  onPreInstructions,
}: TaskBoardProps) {
  const [activeColIdx, setActiveColIdx] = useState(0)
  useEffect(() => setActiveColIdx(0), [kanbanView])

  const columns =
    kanbanView === 'by_agent'
      ? agents.map((agent) => ({
          key: agent.id,
          tasks: tasks.filter((t) => t.agentId === agent.id),
          tab: (
            <div className="flex items-center gap-1.5">
              <img
                src={`https://robohash.org/${agent.id}?set=set1&size=20x20`}
                alt={agent.name}
                className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"
              />
              <span className="whitespace-nowrap">{agent.name}</span>
            </div>
          ),
        }))
      : STATUS_COLUMNS.map(({ status, label, accentColor }) => ({
          key: status,
          tasks: tasks.filter((t) => t.status === status),
          tab: (
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${accentColor}`} />
              <span className="whitespace-nowrap">{label}</span>
            </div>
          ),
        }))

  const activeCol = columns[activeColIdx] ?? columns[0]

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['by_agent', 'by_status'] as KanbanView[]).map((v) => (
            <button
              key={v}
              onClick={() => onKanbanViewChange?.(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                kanbanView === v
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {v === 'by_agent' ? 'By Agent' : 'By Status'}
            </button>
          ))}
        </div>
        <button
          onClick={onCreateTask}
          className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* ── Mobile: column tab strip ─────────────────────────── */}
      <div className="md:hidden shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex gap-1 px-3 py-2 min-w-max">
          {columns.map((col, i) => (
            <button
              key={col.key}
              onClick={() => setActiveColIdx(i)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                i === activeColIdx
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {col.tab}
              <span className={`text-xs tabular-nums rounded-full px-1.5 py-0 leading-5 ${
                i === activeColIdx
                  ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {col.tasks.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile: single column ────────────────────────────── */}
      {activeCol && (
        <div className="md:hidden flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {kanbanView === 'by_agent' && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {activeCol.tasks.length} task{activeCol.tasks.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => onPreInstructions?.(activeCol.key)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Pre-instructions
              </button>
            </div>
          )}

          {activeCol.tasks.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No tasks
            </div>
          ) : (
            activeCol.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onSelectTask?.(task.id)} />
            ))
          )}

          <button
            onClick={onCreateTask}
            className="w-full flex items-center justify-center gap-1.5 mt-2 px-3 py-3 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add task
          </button>
        </div>
      )}

      {/* ── Desktop: kanban columns ──────────────────────────── */}
      <div className="hidden md:block flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 px-5 py-5 h-full min-w-max items-start">
          {kanbanView === 'by_agent'
            ? agents.map((agent) => (
                <AgentColumn
                  key={agent.id}
                  agent={agent}
                  tasks={tasks.filter((t) => t.agentId === agent.id)}
                  onSelectTask={onSelectTask}
                  onPreInstructions={onPreInstructions}
                  onCreateTask={onCreateTask}
                />
              ))
            : STATUS_COLUMNS.map(({ status, label, accentColor }) => (
                <StatusColumn
                  key={status}
                  status={status}
                  label={label}
                  accentColor={accentColor}
                  tasks={tasks.filter((t) => t.status === status)}
                  onSelectTask={onSelectTask}
                  onCreateTask={onCreateTask}
                />
              ))}
        </div>
      </div>
    </div>
  )
}

// ── Column shell ──────────────────────────────────────────────────────

function ColumnShell({
  header,
  tasks,
  onSelectTask,
  onCreateTask,
}: {
  header: React.ReactNode
  tasks: Task[]
  onSelectTask?: (id: string) => void
  onCreateTask?: () => void
}) {
  return (
    <div className="w-72 shrink-0 flex flex-col rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 max-h-[calc(100vh-11rem)] overflow-hidden">
      <div className="px-3 pt-3 pb-2 shrink-0">{header}</div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onSelectTask?.(task.id)} />
            ))
          )}
        </div>
      </div>
      <div className="px-2 pb-2 shrink-0">
        <button
          onClick={onCreateTask}
          className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>
    </div>
  )
}

function AgentColumn({
  agent,
  tasks,
  onSelectTask,
  onPreInstructions,
  onCreateTask,
}: {
  agent: AgentRef
  tasks: Task[]
  onSelectTask?: (id: string) => void
  onPreInstructions?: (agentId: string) => void
  onCreateTask?: () => void
}) {
  return (
    <ColumnShell
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={`https://robohash.org/${agent.id}?set=set1&size=32x32`}
              alt={agent.name}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{agent.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums bg-slate-300/60 dark:bg-slate-700/60 rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
            <button
              onClick={() => onPreInstructions?.(agent.id)}
              title="Pre-instructions"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      }
      tasks={tasks}
      onSelectTask={onSelectTask}
      onCreateTask={onCreateTask}
    />
  )
}

function StatusColumn({
  status,
  label,
  accentColor,
  tasks,
  onSelectTask,
  onCreateTask,
}: {
  status: TaskStatus
  label: string
  accentColor: string
  tasks: Task[]
  onSelectTask?: (id: string) => void
  onCreateTask?: () => void
}) {
  return (
    <ColumnShell
      header={
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${accentColor}`} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums ml-auto bg-slate-300/60 dark:bg-slate-700/60 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
      }
      tasks={tasks}
      onSelectTask={onSelectTask}
      onCreateTask={onCreateTask}
    />
  )
}

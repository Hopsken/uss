import { useState } from 'react'
import { X, Save, Columns, FileText } from 'lucide-react'
import type { TasksProps, AgentPreInstructions } from '../types'
import { TaskBoard } from './TaskBoard'
import { TaskDetail } from './TaskDetail'
import { CreateTaskModal } from './CreateTaskModal'
import { TemplatesList } from './TemplatesList'

type Section = 'board' | 'templates'

export function Tasks({
  tasks,
  templates,
  preInstructions,
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
  onSavePreInstructions,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: TasksProps) {
  const [section, setSection] = useState<Section>('board')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [preInstructionsAgentId, setPreInstructionsAgentId] = useState<string | null>(null)

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
            onPreInstructions={(agentId) => setPreInstructionsAgentId(agentId)}
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

      {/* Pre-instructions editor */}
      {preInstructionsAgentId && (
        <PreInstructionsModal
          agentId={preInstructionsAgentId}
          agents={agents}
          preInstructions={preInstructions}
          onClose={() => setPreInstructionsAgentId(null)}
          onSave={(agentId, instructions) => {
            onSavePreInstructions?.(agentId, instructions)
            setPreInstructionsAgentId(null)
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
  icon: React.ReactNode
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

// ── Pre-instructions modal ──────────────────────────────────────────────────

interface PreInstructionsModalProps {
  agentId: string
  agents: { id: string; name: string; role: string }[]
  preInstructions: AgentPreInstructions[]
  onClose: () => void
  onSave: (agentId: string, instructions: string) => void
}

function PreInstructionsModal({
  agentId,
  agents,
  preInstructions,
  onClose,
  onSave,
}: PreInstructionsModalProps) {
  const agent = agents.find((a) => a.id === agentId)
  const existing = preInstructions.find((p) => p.agentId === agentId)
  const [value, setValue] = useState(existing?.instructions ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {agent && (
              <img
                src={`https://robohash.org/${agent.id}?set=set1&size=32x32`}
                alt={agent.name}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {agent?.name ?? 'Agent'} — Pre-instructions
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prepended to all tasks for this agent
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Default instructions prepended to all tasks assigned to ${agent?.name ?? 'this agent'}…`}
            rows={10}
            className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y transition-shadow font-mono leading-relaxed"
          />
          {existing && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Last updated{' '}
              {new Date(existing.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(agentId, value)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

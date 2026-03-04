import { useState } from 'react'
import { Plus, Trash2, X, Save, ChevronDown, FileText } from 'lucide-react'
import type { TaskTemplate, AgentRef } from './types'

interface TemplatesListProps {
  templates: TaskTemplate[]
  agents: AgentRef[]
  onCreate?: (template: Omit<TaskTemplate, 'id'>) => void
  onUpdate?: (templateId: string, changes: Partial<Omit<TaskTemplate, 'id'>>) => void
  onDelete?: (templateId: string) => void
}

type EditingTemplate = Omit<TaskTemplate, 'id'> & { id?: string }

const emptyTemplate: EditingTemplate = {
  name: '',
  description: '',
  defaultInstructions: '',
  suggestedAgentId: undefined,
}

export function TemplatesList({ templates, agents, onCreate, onUpdate, onDelete }: TemplatesListProps) {
  const [editing, setEditing] = useState<EditingTemplate | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const isNew = editing !== null && !editing.id

  function openCreate() {
    setEditing({ ...emptyTemplate })
  }

  function openEdit(tmpl: TaskTemplate) {
    setEditing({ ...tmpl })
  }

  function closePanel() {
    setEditing(null)
    setDeleteConfirmId(null)
  }

  function handleSave() {
    if (!editing || !editing.name.trim()) return
    if (editing.id) {
      const { id, ...changes } = editing
      onUpdate?.(id, changes)
    } else {
      onCreate?.({ ...editing, name: editing.name.trim() })
    }
    closePanel()
  }

  function handleDelete(id: string) {
    onDelete?.(id)
    setDeleteConfirmId(null)
    if (editing?.id === id) closePanel()
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow'

  return (
    <div className="flex h-full min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* ── Left: template list ──────────────────────────────────── */}
      <div className={`${editing ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Templates</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No templates yet</p>
              <button
                onClick={openCreate}
                className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
              >
                Create your first template
              </button>
            </div>
          ) : (
            templates.map((tmpl) => {
              const suggestedAgent = agents.find((a) => a.id === tmpl.suggestedAgentId)
              const isActive = editing?.id === tmpl.id

              return (
                <button
                  key={tmpl.id}
                  onClick={() => openEdit(tmpl)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isActive ? 'bg-sky-50/70 dark:bg-sky-900/10 border-l-2 border-l-sky-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-medium leading-snug ${isActive ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-100'}`}>
                      {tmpl.name}
                    </p>
                    <div
                      className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        role="button"
                        onClick={() => setDeleteConfirmId(tmpl.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {tmpl.description}
                  </p>
                  {suggestedAgent ? (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`https://robohash.org/${suggestedAgent.id}?set=set1&size=16x16`}
                        alt={suggestedAgent.name}
                        className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700"
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{suggestedAgent.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-600">Any agent</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right: form panel ───────────────────────────────────── */}
      <div className={`${editing ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 overflow-y-auto flex-col`}>
        {editing ? (
          <div className="max-w-xl mx-auto w-full px-5 md:px-8 py-6 md:py-7">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-2">
                <button
                  onClick={closePanel}
                  className="md:hidden flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mr-1"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {isNew ? 'New Template' : 'Edit Template'}
                </h2>
              </div>
              <button
                onClick={closePanel}
                className="hidden md:block text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. Weekly Status Report"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <input
                  type="text"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="One-line summary shown in the template picker"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Suggested Agent <span className="font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  {editing.suggestedAgentId && (
                    <img
                      src={`https://robohash.org/${editing.suggestedAgentId}?set=set1&size=24x24`}
                      alt=""
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 pointer-events-none z-10"
                    />
                  )}
                  <select
                    value={editing.suggestedAgentId ?? ''}
                    onChange={(e) =>
                      setEditing({ ...editing, suggestedAgentId: e.target.value || undefined })
                    }
                    className={`${inputClass} ${editing.suggestedAgentId ? 'pl-10' : ''} pr-8 appearance-none`}
                  >
                    <option value="">Any agent</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Default Instructions</label>
                <textarea
                  value={editing.defaultInstructions}
                  onChange={(e) => setEditing({ ...editing, defaultInstructions: e.target.value })}
                  placeholder="The instructions that will pre-fill the task form when this template is applied…"
                  rows={10}
                  className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-7 pt-5 border-t border-slate-100 dark:border-slate-800">
              {!isNew && (
                <button
                  onClick={() => setDeleteConfirmId(editing.id!)}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete template
                </button>
              )}
              <div className={`flex items-center gap-3 ${isNew ? 'ml-auto' : ''}`}>
                <button
                  onClick={closePanel}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editing.name.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isNew ? 'Create Template' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
              <FileText className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Select a template to edit</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">or create a new one</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        )}
      </div>

      {/* ── Delete confirmation dialog ───────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">Delete template?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This will permanently remove the template. Tasks created from it won't be affected.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

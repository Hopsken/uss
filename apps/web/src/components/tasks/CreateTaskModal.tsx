import { useState } from 'react'
import { X, ChevronDown, Search, FileText, ArrowLeft } from 'lucide-react'
import type { Task, TaskTemplate, AgentRef, TaskSchedule, SchedulePreset } from './types'

const PRESETS: Array<{ value: SchedulePreset; label: string }> = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (cron)' },
]

interface CreateTaskModalProps {
  agents: AgentRef[]
  templates: TaskTemplate[]
  defaultTaskType?: 'one_time' | 'recurring'
  title?: string
  onClose?: () => void
  onSubmit?: (
    task: Omit<
      Task,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'changelog'
      | 'executionLog'
      | 'completedAt'
      | 'nextRunAt'
      | 'lastRunStatus'
      | 'lastRunAt'
      | 'lastRunError'
    >,
  ) => void
}

export function CreateTaskModal({
  agents,
  templates,
  defaultTaskType = 'one_time',
  title: modalTitle = 'New Task',
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? '')
  const [scheduleType, setScheduleType] = useState<'one_time' | 'recurring'>(defaultTaskType)
  const [scheduledAt, setScheduledAt] = useState('')
  const [preset, setPreset] = useState<SchedulePreset>('daily')
  const [cron, setCron] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase()),
  )

  function applyTemplate(template: TaskTemplate) {
    setTitle(template.name)
    setInstructions(template.defaultInstructions)
    if (template.suggestedAgentId) setSelectedAgentId(template.suggestedAgentId)
    setShowTemplates(false)
  }

  function buildSchedule(): TaskSchedule {
    if (scheduleType === 'one_time') {
      return {
        type: 'one_time',
        scheduledAt: scheduledAt || new Date().toISOString(),
        humanReadable: scheduledAt
          ? new Date(scheduledAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : 'Now',
      }
    }
    return {
      type: 'recurring',
      preset,
      cronExpression: preset === 'custom' && cron ? cron : undefined,
      humanReadable:
        preset === 'custom' && cron ? cron : `${preset.charAt(0).toUpperCase()}${preset.slice(1)}`,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedAgent) return
    onSubmit?.({
      title: title.trim(),
      instructions: instructions.trim(),
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      agentRole: selectedAgent.role,
      status: 'pending',
      schedule: buildSchedule(),
      templateId: null,
    })
  }

  const inputClass =
    'w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg
                      h-[95dvh] sm:h-auto sm:max-h-[90vh]
                      bg-white dark:bg-slate-900
                      rounded-t-2xl sm:rounded-2xl
                      shadow-2xl border border-slate-200 dark:border-slate-700
                      flex flex-col">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {showTemplates ? (
            <button
              onClick={() => setShowTemplates(false)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to form
            </button>
          ) : (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{modalTitle}</h2>
          )}
          <div className="flex items-center gap-3">
            {!showTemplates && (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Templates
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showTemplates ? (
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates…"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
              <div className="space-y-2">
                {filteredTemplates.map((tmpl) => {
                  const suggestedAgent = agents.find((a) => a.id === tmpl.suggestedAgentId)
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl)}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/60 dark:hover:bg-sky-900/10 transition-all"
                    >
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{tmpl.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tmpl.description}</p>
                      {suggestedAgent && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <img
                            src={`https://robohash.org/${suggestedAgent.id}?set=set1&size=16x16`}
                            alt={suggestedAgent.name}
                            className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700"
                          />
                          <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                            {suggestedAgent.name}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <form id="create-task-form" onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Inbox Triage"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Agent</label>
                <div className="relative">
                  {selectedAgent && (
                    <img
                      src={`https://robohash.org/${selectedAgent.id}?set=set1&size=24x24`}
                      alt={selectedAgent.name}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 pointer-events-none z-10"
                    />
                  )}
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className={`${inputClass} pl-10 pr-8 appearance-none`}
                  >
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Schedule</label>
                <div className="flex gap-2 mb-3">
                  {(['one_time', 'recurring'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setScheduleType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        scheduleType === t
                          ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {t === 'one_time' ? 'One-time' : 'Recurring'}
                    </button>
                  ))}
                </div>
                {scheduleType === 'one_time' ? (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={preset}
                        onChange={(e) => setPreset(e.target.value as SchedulePreset)}
                        className={`${inputClass} pr-8 appearance-none`}
                      >
                        {PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {preset === 'custom' && (
                      <input
                        type="text"
                        value={cron}
                        onChange={(e) => setCron(e.target.value)}
                        placeholder="Cron expression, e.g. 0 9 * * 1"
                        className={`${inputClass} font-mono`}
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe what the agent should do…"
                  rows={6}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </form>
          )}
        </div>

        {!showTemplates && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form"
              className="px-5 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors shadow-sm"
            >
              Create Task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import type {
  AgentDetailProps,
  TaskHistoryItem,
  SkillSummary,
  ConfigDoc,
} from '../types'

// ── Shared palette (matches AgentCard) ──────────────────────────────────────

const PALETTE = [
  { bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-700 dark:text-sky-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/50', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-700 dark:text-orange-300' },
]

function agentColorIndex(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return h % PALETTE.length
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; text: string; pulse: boolean }> = {
  idle: { dot: 'bg-slate-400 dark:bg-slate-500', label: 'Idle', text: 'text-slate-500 dark:text-slate-400', pulse: false },
  busy: { dot: 'bg-amber-500', label: 'Busy', text: 'text-amber-600 dark:text-amber-400', pulse: true },
  error: { dot: 'bg-red-500', label: 'Error', text: 'text-red-600 dark:text-red-400', pulse: false },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-800 dark:text-slate-200">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const key = i

    if (line.startsWith('# ')) {
      nodes.push(
        <h1
          key={key}
          className="text-lg font-semibold text-slate-900 dark:text-white mt-1 mb-3"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {line.slice(2)}
        </h1>,
      )
    } else if (line.startsWith('## ')) {
      nodes.push(
        <h2
          key={key}
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-5 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {line.slice(3)}
        </h2>,
      )
    } else if (line.startsWith('### ')) {
      nodes.push(
        <h3
          key={key}
          className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 mb-1.5"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {line.slice(4)}
        </h3>,
      )
    } else if (line.startsWith('- ')) {
      nodes.push(
        <li key={key} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed ml-4 list-disc">
          {renderInline(line.slice(2))}
        </li>,
      )
    } else if (line.trim() === '') {
      nodes.push(<div key={key} className="h-2" />)
    } else {
      nodes.push(
        <p key={key} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {renderInline(line)}
        </p>,
      )
    }
  }

  return <div className="space-y-0.5">{nodes}</div>
}

// ── Task Row ──────────────────────────────────────────────────────────────────

const TASK_STATUS = {
  running: {
    icon: <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />,
    text: 'text-sky-600 dark:text-sky-400',
  },
  completed: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    text: 'text-slate-700 dark:text-slate-300',
  },
  failed: {
    icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    text: 'text-red-600 dark:text-red-400',
  },
  scheduled: {
    icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
    text: 'text-slate-500 dark:text-slate-400',
  },
}

function TaskRow({ task, isLast }: { task: TaskHistoryItem; isLast: boolean }) {
  const cfg = TASK_STATUS[task.status] ?? TASK_STATUS.scheduled

  return (
    <div
      className={[
        'flex items-center gap-3 px-4 py-3',
        !isLast ? 'border-b border-slate-100 dark:border-slate-800' : '',
      ].join(' ')}
    >
      <span className="shrink-0">{cfg.icon}</span>
      <span className={`text-sm flex-1 min-w-0 truncate ${cfg.text}`}>{task.title}</span>
      <span
        className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {relativeTime(task.ranAt)}
      </span>
    </div>
  )
}

// ── Skill Row ─────────────────────────────────────────────────────────────────

function SkillRow({ skill, isLast }: { skill: SkillSummary; isLast: boolean }) {
  return (
    <div
      className={[
        'flex items-center justify-between px-4 py-3',
        !isLast ? 'border-b border-slate-100 dark:border-slate-800' : '',
      ].join(' ')}
    >
      <span
        className={`text-sm ${skill.enabled ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}
      >
        {skill.name}
      </span>
      <span
        className={[
          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
          skill.enabled
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500',
        ].join(' ')}
        style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
      >
        {skill.enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

// ── File Tab ──────────────────────────────────────────────────────────────────

function FileTab({
  doc,
  isSelected,
  onClick,
}: {
  doc: ConfigDoc
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 transition-colors',
        isSelected
          ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300',
      ].join(' ')}
    >
      <span
        className="text-xs"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {doc.filename}
      </span>
    </button>
  )
}

// ── Model Selector ────────────────────────────────────────────────────────────

function ModelSelector({
  agentId,
  currentModel,
  availableModels,
  onChangeModel,
}: {
  agentId: string
  currentModel: { id: string; name: string }
  availableModels: { id: string; name: string }[]
  onChangeModel?: (agentId: string, modelId: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-700 transition-colors text-left"
      >
        <span
          className="text-xs text-slate-700 dark:text-slate-300"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {currentModel.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 overflow-hidden py-1">
            {availableModels.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChangeModel?.(agentId, m.id)
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span
                  className="text-xs text-slate-700 dark:text-slate-300"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {m.name}
                </span>
                {m.id === currentModel.id && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span
        className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase"
        style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
      >
        {children}
      </span>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-xs text-sky-500 hover:text-sky-400 transition-colors"
        >
          {action} →
        </button>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AgentDetail({
  agent,
  availableModels,
  onBack,
  onChangeModel,
  onViewTasks,
}: AgentDetailProps) {
  const [selectedDoc, setSelectedDoc] = useState<string>(agent.configDocs[0]?.filename ?? '')
  const color = PALETTE[agentColorIndex(agent.id)]
  const status = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
  const currentDoc = agent.configDocs.find((d) => d.filename === selectedDoc)
  const enabledSkills = agent.skills.filter((s) => s.enabled)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Agents
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <img
            src={`https://robohash.org/${agent.id}?set=set1&size=112x112`}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {agent.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{agent.role}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="relative flex w-2 h-2 shrink-0">
              {status.pulse && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              )}
              <span className={`relative inline-flex rounded-full w-2 h-2 ${status.dot}`} />
            </span>
            <span className={`text-xs ${status.text}`}>{status.label}</span>
          </div>
        </div>

        <ModelSelector
          agentId={agent.id}
          currentModel={agent.model}
          availableModels={availableModels}
          onChangeModel={onChangeModel}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Tasks', value: String(agent.recentTasks.length), sub: 'recent runs' },
          { label: 'Skills', value: String(enabledSkills.length), sub: `of ${agent.skills.length} enabled` },
          { label: 'Cost', value: `$${agent.usageSummary.costUsd.toFixed(2)}`, sub: 'this period' },
          { label: 'Tokens', value: formatTokens(agent.usageSummary.tokens), sub: `${agent.usageSummary.conversations} conversations` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <p
              className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              {stat.label}
            </p>
            <p
              className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent tasks + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section>
          <SectionLabel action="View all" onAction={() => onViewTasks?.(agent.id)}>
            Recent Tasks
          </SectionLabel>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            {agent.recentTasks.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">No recent tasks</p>
            ) : (
              agent.recentTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} isLast={i === agent.recentTasks.length - 1} />
              ))
            )}
          </div>
        </section>

        <section>
          <SectionLabel>Skills</SectionLabel>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            {agent.skills.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">No skills configured</p>
            ) : (
              agent.skills.map((skill, i) => (
                <SkillRow key={skill.id} skill={skill} isLast={i === agent.skills.length - 1} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Config docs */}
      <section>
        <SectionLabel>Configuration</SectionLabel>
        <div
          className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 flex flex-col md:flex-row"
          style={{ minHeight: '420px' }}
        >
          {/* File list */}
          <div className="md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex md:flex-col overflow-x-auto md:overflow-x-visible">
            {agent.configDocs.map((doc) => (
              <FileTab
                key={doc.filename}
                doc={doc}
                isSelected={selectedDoc === doc.filename}
                onClick={() => setSelectedDoc(doc.filename)}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 min-w-0">
            {currentDoc ? (
              <MarkdownContent content={currentDoc.content} />
            ) : (
              <p className="text-sm text-slate-400">Select a file</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

import { useMemo, useState } from 'react'
import {
  Play,
  Plug,
  MessageSquare,
  Terminal,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  ChevronDown,
  X,
} from 'lucide-react'
import type { ActivityProps, EventType, EventStatus, ActivityEvent } from '../types'

// ── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<EventType, {
  label: string
  icon: React.ReactNode
  bg: string
  text: string
  border: string
}> = {
  task_run: {
    label: 'Task',
    icon: <Play className="w-2.5 h-2.5" />,
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30',
  },
  skill_invoked: {
    label: 'Skill',
    icon: <Plug className="w-2.5 h-2.5" />,
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/30',
  },
  conversation: {
    label: 'Chat',
    icon: <MessageSquare className="w-2.5 h-2.5" />,
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  system: {
    label: 'System',
    icon: <Terminal className="w-2.5 h-2.5" />,
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-500/30',
  },
}

const STATUS_CONFIG: Record<EventStatus, {
  icon: React.ReactNode
  bar: string
}> = {
  success: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    bar: 'bg-emerald-500',
  },
  failed: {
    icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    bar: 'bg-red-500',
  },
  running: {
    icon: <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
    bar: 'bg-amber-500',
  },
  info: {
    icon: <Info className="w-3.5 h-3.5 text-slate-400" />,
    bar: 'bg-slate-400',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDateKey(iso: string): string {
  return new Date(iso).toDateString()
}

function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface EventRowProps {
  event: ActivityEvent
}

function EventRow({ event }: EventRowProps) {
  const typeConf = TYPE_CONFIG[event.eventType]
  const statusConf = STATUS_CONFIG[event.status]

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
      <div className={`w-0.5 self-stretch rounded-full mt-0.5 shrink-0 ${statusConf.bar}`} />

      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
        <img
          src={`https://robohash.org/${event.agentId}?set=set1&size=56x56`}
          alt={event.agentName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {event.agentName}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeConf.bg} ${typeConf.text} ${typeConf.border}`}
          >
            {typeConf.icon}
            {typeConf.label}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pr-2">
          {event.description}
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1 mt-0.5">
        <span
          className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {formatTime(event.occurredAt)}
        </span>
        {statusConf.icon}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Activity({
  events,
  agents,
  activeAgentId,
  activeEventType,
  onFilterByAgent,
  onFilterByType,
}: ActivityProps) {
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false)

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        if (activeAgentId && e.agentId !== activeAgentId) return false
        if (activeEventType && e.eventType !== activeEventType) return false
        return true
      })
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  }, [events, activeAgentId, activeEventType])

  const grouped = useMemo(() => {
    const map: Record<string, ActivityEvent[]> = {}
    for (const e of filtered) {
      const key = getDateKey(e.occurredAt)
      if (!map[key]) map[key] = []
      map[key].push(e)
    }
    const orderedKeys = Object.keys(map).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )
    return orderedKeys.map((key) => ({ dateKey: key, events: map[key] }))
  }, [filtered])

  const activeAgent = agents.find((a) => a.id === activeAgentId)

  const EVENT_TYPES: EventType[] = ['task_run', 'skill_invoked', 'conversation', 'system']

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-wrap sticky top-0 z-10">

        {/* Agent selector */}
        <div className="relative">
          <button
            onClick={() => setAgentDropdownOpen((v) => !v)}
            className={`flex items-center gap-1.5 h-7 pl-2 pr-2 rounded-md text-xs font-medium border transition-colors ${
              activeAgentId
                ? 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-sky-900/30 dark:border-sky-700 dark:text-sky-300'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            {activeAgent ? (
              <>
                <div className="w-4 h-4 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-600">
                  <img
                    src={`https://robohash.org/${activeAgent.id}?set=set1&size=32x32`}
                    alt={activeAgent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{activeAgent.name}</span>
              </>
            ) : (
              <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>All agents</span>
            )}
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </button>

          {agentDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAgentDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg shadow-slate-900/10 dark:shadow-slate-900/40 py-1 min-w-[140px]">
                <button
                  onClick={() => { onFilterByAgent?.(null); setAgentDropdownOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    !activeAgentId ? 'text-sky-600 dark:text-sky-400 font-medium' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-400">★</span>
                  <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>All agents</span>
                </button>
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => { onFilterByAgent?.(agent.id); setAgentDropdownOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      activeAgentId === agent.id ? 'text-sky-600 dark:text-sky-400 font-medium' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-600 shrink-0">
                      <img
                        src={`https://robohash.org/${agent.id}?set=set1&size=32x32`}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{agent.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

        {/* Event type pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {EVENT_TYPES.map((type) => {
            const conf = TYPE_CONFIG[type]
            const isActive = activeEventType === type
            return (
              <button
                key={type}
                onClick={() => onFilterByType?.(isActive ? null : type)}
                className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium border transition-colors ${
                  isActive
                    ? `${conf.bg} ${conf.text} ${conf.border}`
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-600'
                }`}
              >
                {conf.icon}
                {conf.label}
              </button>
            )
          })}
        </div>

        {(activeAgentId || activeEventType) && (
          <button
            onClick={() => { onFilterByAgent?.(null); onFilterByType?.(null) }}
            className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* ── Feed ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5 text-slate-400" />
            </div>
            <p
              className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              No events found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Try adjusting the filters above
            </p>
          </div>
        ) : (
          grouped.map(({ dateKey, events: dateEvents }) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 px-4 py-2 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm z-[5] border-b border-slate-100 dark:border-slate-800/60">
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {formatDateLabel(dateKey)}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span
                  className="text-[10px] text-slate-400 dark:text-slate-500"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {dateEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

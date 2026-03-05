'use client'

import Image from 'next/image'
import { useMemo, useState, type ReactNode } from 'react'
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
import type { ActivityProps, EventType, EventStatus, ActivityEvent } from './types'

const TYPE_CONFIG: Record<
  EventType,
  {
    label: string
    icon: ReactNode
    bg: string
    text: string
    border: string
  }
> = {
  task_run: {
    label: 'Task',
    icon: <Play className="h-2.5 w-2.5" />,
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30',
  },
  skill_invoked: {
    label: 'Skill',
    icon: <Plug className="h-2.5 w-2.5" />,
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/30',
  },
  conversation: {
    label: 'Chat',
    icon: <MessageSquare className="h-2.5 w-2.5" />,
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  system: {
    label: 'System',
    icon: <Terminal className="h-2.5 w-2.5" />,
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-500/30',
  },
}

const STATUS_CONFIG: Record<
  EventStatus,
  {
    icon: ReactNode
    bar: string
  }
> = {
  success: {
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    bar: 'bg-emerald-500',
  },
  failed: {
    icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
    bar: 'bg-red-500',
  },
  running: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />,
    bar: 'bg-amber-500',
  },
  info: {
    icon: <Info className="h-3.5 w-3.5 text-slate-400" />,
    bar: 'bg-slate-400',
  },
}

function getDateKey(iso: string): string {
  return new Date(iso).toDateString()
}

function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatRelativeTime(iso: string): string {
  const t = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - t.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const timePart = t.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (t.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timePart.toLowerCase()}`
  }

  return `${t.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} at ${timePart.toLowerCase()}`
}

function EventRow({ event }: { event: ActivityEvent }) {
  const typeConf = TYPE_CONFIG[event.eventType]
  const statusConf = STATUS_CONFIG[event.status]

  return (
    <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
      <div className={`mt-0.5 w-0.5 shrink-0 self-stretch rounded-full ${statusConf.bar}`} />

      <div className="mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/60">
        <Image
          src={`https://robohash.org/${event.agentId}?set=set1&size=56x56`}
          alt={event.agentName}
          width={28}
          height={28}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {event.agentName}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${typeConf.bg} ${typeConf.text} ${typeConf.border}`}
          >
            {typeConf.icon}
            {typeConf.label}
          </span>
        </div>

        <p className="pr-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{event.description}</p>
      </div>

      <div className="mt-0.5 flex shrink-0 flex-col items-end gap-1">
        <span
          className="text-[10px] text-slate-400 dark:text-slate-500"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {formatRelativeTime(event.occurredAt)}
        </span>
        {statusConf.icon}
      </div>
    </div>
  )
}

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
      .filter((event) => {
        if (activeAgentId && event.agentId !== activeAgentId) return false
        if (activeEventType && event.eventType !== activeEventType) return false
        return true
      })
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  }, [events, activeAgentId, activeEventType])

  const grouped = useMemo(() => {
    const groupedByDate: Record<string, ActivityEvent[]> = {}

    for (const event of filtered) {
      const key = getDateKey(event.occurredAt)
      if (!groupedByDate[key]) {
        groupedByDate[key] = []
      }
      groupedByDate[key].push(event)
    }

    return Object.keys(groupedByDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((dateKey) => ({ dateKey, events: groupedByDate[dateKey] ?? [] }))
  }, [filtered])

  const activeAgent = agents.find((agent) => agent.id === activeAgentId)
  const eventTypes: EventType[] = ['task_run', 'skill_invoked', 'conversation', 'system']

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <button
            onClick={() => setAgentDropdownOpen((open) => !open)}
            className={`flex h-7 items-center gap-1.5 rounded-md border pl-2 pr-2 text-xs font-medium transition-colors ${
              activeAgentId
                ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            {activeAgent ? (
              <>
                <div className="h-4 w-4 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-600">
                  <Image
                    src={`https://robohash.org/${activeAgent.id}?set=set1&size=32x32`}
                    alt={activeAgent.name}
                    width={16}
                    height={16}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{activeAgent.name}</span>
              </>
            ) : (
              <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>All agents</span>
            )}
            <ChevronDown className="ml-0.5 h-3 w-3 opacity-60" />
          </button>

          {agentDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAgentDropdownOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40">
                <button
                  onClick={() => {
                    onFilterByAgent?.(null)
                    setAgentDropdownOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    !activeAgentId
                      ? 'font-medium text-sky-600 dark:text-sky-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-400 dark:bg-slate-700">
                    ★
                  </span>
                  <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>All agents</span>
                </button>

                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onFilterByAgent?.(agent.id)
                      setAgentDropdownOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      activeAgentId === agent.id
                        ? 'font-medium text-sky-600 dark:text-sky-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-600">
                      <Image
                        src={`https://robohash.org/${agent.id}?set=set1&size=32x32`}
                        alt={agent.name}
                        width={16}
                        height={16}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{agent.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="flex flex-wrap items-center gap-1.5">
          {eventTypes.map((type) => {
            const conf = TYPE_CONFIG[type]
            const isActive = activeEventType === type

            return (
              <button
                key={type}
                onClick={() => onFilterByType?.(isActive ? null : type)}
                className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? `${conf.bg} ${conf.text} ${conf.border}`
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:border-slate-600'
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
            onClick={() => {
              onFilterByAgent?.(null)
              onFilterByType?.(null)
            }}
            className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Terminal className="h-5 w-5 text-slate-400" />
            </div>
            <p
              className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              No events found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting the filters above</p>
            {(activeAgentId || activeEventType) && (
              <button
                onClick={() => {
                  onFilterByAgent?.(null)
                  onFilterByType?.(null)
                }}
                className="mt-2 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          grouped.map(({ dateKey, events: dateEvents }) => (
            <div key={dateKey}>
              <div className="sticky top-0 z-[5] flex items-center gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-2 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/90">
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {formatDateLabel(dateKey)}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
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

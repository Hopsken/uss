import type { Agent } from '../types'

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

const STATUS_CONFIG: Record<
  string,
  { dot: string; label: string; text: string; pulse: boolean }
> = {
  idle: {
    dot: 'bg-slate-400 dark:bg-slate-500',
    label: 'Idle',
    text: 'text-slate-500 dark:text-slate-400',
    pulse: false,
  },
  busy: {
    dot: 'bg-amber-500',
    label: 'Busy',
    text: 'text-amber-600 dark:text-amber-400',
    pulse: true,
  },
  error: {
    dot: 'bg-red-500',
    label: 'Error',
    text: 'text-red-600 dark:text-red-400',
    pulse: false,
  },
}

interface AgentCardProps {
  agent: Agent
  onClick?: () => void
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const color = PALETTE[agentColorIndex(agent.id)]
  const status = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
  const initials = agent.name.slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full mb-4 overflow-hidden transition-transform duration-200 group-hover:scale-105 bg-slate-100 dark:bg-slate-800">
        <img
          src={`https://robohash.org/${agent.id}?set=set1&size=96x96`}
          alt={agent.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name */}
      <p
        className="font-semibold text-sm text-slate-900 dark:text-white leading-tight"
        style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
      >
        {agent.name}
      </p>

      {/* Role */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{agent.role}</p>

      {/* Status */}
      <div className="flex items-center gap-1.5 mt-3.5">
        <span className="relative flex w-2 h-2 shrink-0">
          {status.pulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
          )}
          <span className={`relative inline-flex rounded-full w-2 h-2 ${status.dot}`} />
        </span>
        <span className={`text-xs ${status.text}`}>{status.label}</span>
      </div>

      {/* Model badge */}
      <div className="mt-3">
        <span
          className="inline-flex text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded leading-4"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {agent.model.name}
        </span>
      </div>
    </button>
  )
}

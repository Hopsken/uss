import type { Agent } from '../types'

const AVATAR_COLORS = [
  'bg-sky-950 text-sky-300',
  'bg-violet-950 text-violet-300',
  'bg-emerald-950 text-emerald-300',
  'bg-amber-950 text-amber-300',
  'bg-rose-950 text-rose-300',
]

function avatarColor(name: string): string {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % 997
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-slate-400',
  busy: 'bg-sky-500 animate-pulse',
  error: 'bg-red-500',
}

interface AgentCardProps {
  agent: Agent
  onClick?: () => void
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const colorClass = avatarColor(agent.name)
  const initials = agent.name.slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-sky-400 dark:hover:border-sky-700 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={`https://robohash.org/${agent.id}?set=set1&size=80x80`}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[agent.status] ?? 'bg-slate-400'}`} />
      </div>

      <p
        className="text-sm font-semibold text-slate-900 dark:text-white leading-tight"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        {agent.name}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{agent.role}</p>

      <div className="mt-3">
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {agent.model}
        </span>
      </div>

      {agent.currentTask && (
        <p className="mt-2 text-xs text-sky-600 dark:text-sky-400 truncate">
          ↳ {agent.currentTask}
        </p>
      )}
    </button>
  )
}

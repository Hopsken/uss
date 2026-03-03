import { RefreshCw } from 'lucide-react'
import type { AgentsListProps } from '../types'
import { AgentCard } from './AgentCard'

export function AgentsList({ agents, isSyncing, onSelectAgent, onSync }: AgentsListProps) {
  const idleCount = agents.filter((a) => a.status === 'idle').length
  const busyCount = agents.filter((a) => a.status === 'busy').length
  const errorCount = agents.filter((a) => a.status === 'error').length

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-xl font-semibold text-slate-900 dark:text-white"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Agents
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm text-slate-400 dark:text-slate-500">
              {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
            </span>
            {busyCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                {busyCount} busy
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                {errorCount} error
              </span>
            )}
            {idleCount === agents.length && (
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                all idle
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync from OpenClaw</span>
          <span className="sm:hidden">Sync</span>
        </button>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onSelectAgent?.(agent.id)}
          />
        ))}
      </div>
    </div>
  )
}

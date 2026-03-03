import { ChevronRight } from 'lucide-react'
import type { BridgeProps } from '../types'
import { AgentCard } from './AgentCard'
import { TaskRunRow } from './TaskRunRow'
import { HealthPanel } from './HealthPanel'
import { UsageTile } from './UsageTile'

function SectionHeader({
  label,
  action,
  onAction,
}: {
  label: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span
        className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        {label}
      </span>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-xs text-sky-500 hover:text-sky-400 transition-colors"
        >
          {action}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export function Bridge({
  agents,
  recentTaskRuns,
  systemHealth,
  usageSnapshot,
  onViewAgents,
  onViewAgent,
  onViewTasks,
  onViewTaskRun,
  onViewUsage,
}: BridgeProps) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1
          className="text-xl font-semibold text-slate-900 dark:text-white"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Bridge
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Command center overview
        </p>
      </div>

      {/* Fleet status */}
      <section>
        <SectionHeader label="Fleet Status" action="View all" onAction={onViewAgents} />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onViewAgent?.(agent.id)}
            />
          ))}
        </div>
      </section>

      {/* Recent tasks + System health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3">
          <SectionHeader label="Recent Tasks" action="View all" onAction={onViewTasks} />
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            {recentTaskRuns.map((run, i) => (
              <TaskRunRow
                key={run.id}
                run={run}
                isLast={i === recentTaskRuns.length - 1}
                onClick={() => onViewTaskRun?.(run.id)}
              />
            ))}
          </div>
        </section>

        <section className="lg:col-span-2">
          <SectionHeader label="System Health" />
          <HealthPanel health={systemHealth} />
        </section>
      </div>

      {/* Usage snapshot */}
      <section>
        <SectionHeader label="Usage" action="View details" onAction={onViewUsage} />
        <div className="grid grid-cols-2 gap-4">
          <UsageTile label="Today" period={usageSnapshot.today} onClick={onViewUsage} />
          <UsageTile label="This Week" period={usageSnapshot.thisWeek} onClick={onViewUsage} />
        </div>
      </section>
    </div>
  )
}

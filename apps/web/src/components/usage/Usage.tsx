import type { UsageProps, AgentUsage, TimeSeriesPoint } from './types'

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface MetricTileProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

function MetricTile({ label, value, sub, accent }: MetricTileProps) {
  return (
    <div className="flex-1 min-w-0 px-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        {label}
      </p>
      <p
        className={`text-xl font-semibold tabular-nums leading-none ${accent ? 'text-sky-600 dark:text-sky-400' : 'text-slate-900 dark:text-white'}`}
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

interface SpendChartProps {
  data: TimeSeriesPoint[]
}

function SpendChart({ data }: SpendChartProps) {
  if (data.length === 0) return null
  const maxCost = Math.max(...data.map((d) => d.cost))
  const firstPoint = data[0]!
  const lastPoint = data[data.length - 1]!

  return (
    <div>
      <div className="flex items-end gap-0.5 h-16">
        {data.map((point) => {
          const pct = maxCost > 0 ? (point.cost / maxCost) * 100 : 0
          return (
            <div
              key={point.date}
              className="flex-1 group relative"
              style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
            >
              <div
                className="w-full rounded-t-sm bg-sky-500/50 dark:bg-sky-500/40 hover:bg-sky-500/80 dark:hover:bg-sky-500/70 transition-colors cursor-default"
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded px-2 py-1 text-[10px] whitespace-nowrap"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {formatCost(point.cost)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between mt-1.5">
        <span
          className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {formatDate(firstPoint.date)}
        </span>
        <span
          className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {formatDate(lastPoint.date)}
        </span>
      </div>
    </div>
  )
}

interface AgentBarProps {
  agent: AgentUsage
  maxCost: number
  isTop: boolean
}

function AgentBar({ agent, maxCost, isTop }: AgentBarProps) {
  const pct = maxCost > 0 ? (agent.cost / maxCost) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200/60 dark:ring-slate-700/40">
        <img
          src={`https://robohash.org/${agent.agentId}?set=set1&size=48x48`}
          alt={agent.agentName}
          className="w-full h-full object-cover"
        />
      </div>

      <span
        className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 shrink-0"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        {agent.agentName}
      </span>

      <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
        <div
          className={`h-full rounded transition-all ${isTop ? 'bg-amber-400/80 dark:bg-amber-500/70' : 'bg-sky-500/50 dark:bg-sky-500/40'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <span
        className={`text-xs tabular-nums w-12 text-right shrink-0 ${isTop ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {formatCost(agent.cost)}
      </span>
    </div>
  )
}

export function Usage({
  summary,
  timeSeries,
  agents,
  modelBreakdown,
  activeTimeRange,
  timeRangeOptions,
  onTimeRangeChange,
}: UsageProps) {
  const sortedAgents = [...agents].sort((a, b) => b.cost - a.cost)
  const maxAgentCost = sortedAgents[0]?.cost ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 w-fit">
        {timeRangeOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimeRangeChange?.(value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTimeRange === value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetricTile label="Total spend" value={formatCost(summary.totalCost)} accent />
        <MetricTile label="Tokens used" value={formatTokens(summary.totalTokens)} />
        <MetricTile label="Conversations" value={`${summary.conversationCount}`} />
        <MetricTile label="Tasks run" value={`${summary.taskRunCount}`} />
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Daily spend
          </p>
          <span
            className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {timeSeries.length > 0
              ? `${formatDate(timeSeries[0]!.date)} - ${formatDate(timeSeries[timeSeries.length - 1]!.date)}`
              : '-'}
          </span>
        </div>

        <SpendChart data={timeSeries} />
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <p
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            By agent
          </p>
        </div>

        <div className="px-4 py-4 space-y-3 border-b border-slate-100 dark:border-slate-800">
          {sortedAgents.map((agent, i) => (
            <AgentBar key={agent.agentId} agent={agent} maxCost={maxAgentCost} isTop={i === 0} />
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Agent', 'Cost', 'Tokens', 'Convos', 'Tasks'].map((col, i) => (
                  <th
                    key={col}
                    className={`py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i === 0 ? 'text-left px-4' : 'text-right px-4'} ${i >= 3 ? 'hidden sm:table-cell' : ''}`}
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {sortedAgents.map((agent, i) => (
                <tr key={agent.agentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/60 dark:ring-slate-700/40 shrink-0">
                        <img src={`https://robohash.org/${agent.agentId}?set=set1&size=48x48`} alt={agent.agentName} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{agent.agentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`tabular-nums font-medium ${i === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`} style={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCost(agent.cost)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="tabular-nums text-slate-500 dark:text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatTokens(agent.totalTokens)}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="tabular-nums text-slate-500 dark:text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{agent.conversationCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="tabular-nums text-slate-500 dark:text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{agent.taskRunCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>By model</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Model', 'Cost', 'Tokens', 'Convos', 'Tasks'].map((col, i) => (
                  <th key={col} className={`py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i === 0 ? 'text-left px-4' : 'text-right px-4'} ${i >= 3 ? 'hidden sm:table-cell' : ''}`} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {[...modelBreakdown].sort((a, b) => b.cost - a.cost).map((model) => (
                <tr key={model.modelId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{model.modelName}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{model.modelId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="tabular-nums font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCost(model.cost)}</span></td>
                  <td className="px-4 py-3 text-right"><span className="tabular-nums text-slate-500 dark:text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatTokens(model.totalTokens)}</span></td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell"><span className="tabular-nums text-slate-500 dark:text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{model.conversationCount}</span></td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell"><span className="tabular-nums text-slate-500 dark:text-slate-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{model.taskRunCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

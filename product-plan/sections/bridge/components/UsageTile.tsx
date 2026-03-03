import type { UsagePeriod } from '../types'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

interface UsageTileProps {
  label: string
  period: UsagePeriod
  onClick?: () => void
}

export function UsageTile({ label, period, onClick }: UsageTileProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left hover:border-sky-300 dark:hover:border-sky-800 hover:shadow-sm transition-all w-full"
    >
      <p
        className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-4"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        {label}
      </p>

      <p
        className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        ${period.costUsd.toFixed(2)}
      </p>

      <div className="flex items-center gap-5 mt-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Tokens</p>
          <p
            className="text-sm font-medium text-slate-600 dark:text-slate-300 tabular-nums mt-0.5"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {formatTokens(period.tokens)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Conversations</p>
          <p
            className="text-sm font-medium text-slate-600 dark:text-slate-300 tabular-nums mt-0.5"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {period.conversations}
          </p>
        </div>
      </div>
    </button>
  )
}

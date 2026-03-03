import { Server, Wifi, AlertCircle, AlertTriangle } from 'lucide-react'
import type { SystemHealth } from '../types'

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
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

const PROVIDER_DOT: Record<string, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
}

const OPENCLAW_STATUS: Record<string, { dot: string; label: string; color: string }> = {
  running: { dot: 'bg-emerald-500', label: 'Running', color: 'text-emerald-600 dark:text-emerald-400' },
  stopped: { dot: 'bg-slate-400', label: 'Stopped', color: 'text-slate-500' },
  error: { dot: 'bg-red-500', label: 'Error', color: 'text-red-600 dark:text-red-400' },
}

interface HealthPanelProps {
  health: SystemHealth
}

export function HealthPanel({ health }: HealthPanelProps) {
  const oc = OPENCLAW_STATUS[health.openclaw.status] ?? OPENCLAW_STATUS.error

  return (
    <div className="space-y-3">
      {/* OpenClaw process */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Server className="w-3 h-3 text-slate-400" />
          <span
            className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            OpenClaw
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${oc.dot}`} />
            <span
              className={`text-sm font-semibold ${oc.color}`}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {oc.label}
            </span>
          </div>
          <div className="text-right space-x-2">
            <span
              className="text-xs text-slate-400"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              v{health.openclaw.version}
            </span>
            <span className="text-xs text-slate-400">
              up {formatUptime(health.openclaw.uptimeSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Providers */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Wifi className="w-3 h-3 text-slate-400" />
          <span
            className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Providers
          </span>
        </div>
        {health.providers.map((p, i) => (
          <div
            key={p.id}
            className={[
              'flex items-center justify-between px-4 py-2.5',
              i < health.providers.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : '',
            ].join(' ')}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PROVIDER_DOT[p.status] ?? 'bg-slate-400'}`} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{p.name}</span>
            </div>
            <span
              className={`text-xs ${p.latencyMs > 1000 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {p.latencyMs}ms
            </span>
          </div>
        ))}
      </div>

      {/* Recent errors */}
      {health.recentErrors.length > 0 && (
        <div className="space-y-2">
          {health.recentErrors.map((err) => (
            <div
              key={err.id}
              className={[
                'flex items-start gap-2.5 px-3 py-2.5 rounded-lg border',
                err.level === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40'
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
              ].join(' ')}
            >
              {err.level === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-xs leading-snug ${
                    err.level === 'error'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {err.message}
                </p>
                <p
                  className="text-[10px] text-slate-400 mt-0.5"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {relativeTime(err.occurredAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

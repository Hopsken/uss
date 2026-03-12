'use client'

import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OpenClawStatus, ProviderStatus, SystemHealth } from '@uss/shared'

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

function statusClass(status: OpenClawStatus | ProviderStatus) {
  if (status === 'running' || status === 'healthy') return 'bg-emerald-500'
  if (status === 'degraded') return 'bg-amber-500'
  if (status === 'stopped') return 'bg-muted-foreground'
  return 'bg-destructive'
}

export function HealthPanel({ health }: { health: SystemHealth }) {
  const { openclaw, providers, recentErrors } = health

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-border/70">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className={cn('size-2 rounded-full', statusClass(openclaw.status), openclaw.status === 'running' && 'uss-status-busy')} />
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">OpenClaw</div>
              <div className="text-sm font-semibold capitalize text-foreground">{openclaw.status}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-muted-foreground">v{openclaw.version}</div>
            <div className="font-mono text-xs text-muted-foreground">{formatUptime(openclaw.uptimeSeconds)}</div>
          </div>
        </CardContent>
      </Card>

      {providers.map((provider) => (
        <Card key={provider.id} className="border-border/70">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className={cn('size-2 rounded-full', statusClass(provider.status))} />
              <div className="text-sm text-foreground">{provider.name}</div>
            </div>
            <div className="font-mono text-xs text-muted-foreground">{provider.latencyMs}ms</div>
          </CardContent>
        </Card>
      ))}

      {recentErrors.slice(0, 2).map((err) => (
        <Card key={err.id} className="border-amber-200/80 bg-amber-50/60">
          <CardContent className="flex gap-3 py-4">
            <AlertCircle className={cn('mt-0.5 size-4 shrink-0', err.level === 'error' ? 'text-destructive' : 'text-amber-600')} />
            <div className="space-y-2">
              <div className={cn('text-sm', err.level === 'error' ? 'text-destructive' : 'text-amber-900')}>{err.message}</div>
              <Badge variant="outline" className="font-mono text-[10px]">{formatRelative(err.occurredAt)}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

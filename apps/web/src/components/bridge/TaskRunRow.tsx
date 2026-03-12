'use client'

import { CheckCircle2, Clock, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RecentTaskRun, TaskRunStatus } from '@uss/shared'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function StatusIcon({ status }: { status: TaskRunStatus }) {
  if (status === 'running') return <Loader2 className="size-4 animate-spin text-primary" />
  if (status === 'completed') return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === 'failed') return <X className="size-4 text-destructive" />
  return <Clock className="size-4 text-muted-foreground" />
}

interface Props {
  run: RecentTaskRun
  isLast: boolean
  onClick: () => void
}

export function TaskRunRow({ run, isLast, onClick }: Props) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-between gap-4 px-1 py-3 text-left transition-colors hover:bg-muted/30',
        !isLast && 'border-b border-border/60',
      )}
      onClick={onClick}
    >
      <div className="flex min-w-0 items-start gap-3">
        <StatusIcon status={run.status} />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{run.taskName}</div>
          {run.error ? <div className="truncate text-xs text-destructive">{run.error}</div> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">{run.agentName}</Badge>
        <span className="font-mono text-xs text-muted-foreground">{relativeTime(run.startedAt)}</span>
      </div>
    </button>
  )
}

'use client'

import type { UsagePeriod } from '@uss/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${n}`
}

interface Props {
  label: string
  period: UsagePeriod
  onClick: () => void
}

export function UsageTile({ label, period, onClick }: Props) {
  return (
    <Card className="cursor-pointer border-border/70 transition-colors hover:border-primary/50" onClick={onClick}>
      <CardHeader>
        <CardDescription className="text-[11px] uppercase tracking-[0.28em]">{label}</CardDescription>
        <CardTitle className="font-mono text-3xl">${period.costUsd.toFixed(2)}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Tokens</div>
          <div className="font-mono">{formatTokens(period.tokens)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Conversations</div>
          <div className="font-mono">{period.conversations}</div>
        </div>
      </CardContent>
    </Card>
  )
}

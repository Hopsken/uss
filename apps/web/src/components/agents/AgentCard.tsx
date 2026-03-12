'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AgentListItem } from '@uss/shared'

function statusClass(status: AgentListItem['status']) {
  if (status === 'busy') return 'bg-amber-500'
  if (status === 'error') return 'bg-destructive'
  return 'bg-emerald-500'
}

export function AgentCard({
  agent,
  onClick,
}: {
  agent: AgentListItem
  onClick?: () => void
}) {
  return (
    <Card className="h-full cursor-pointer border-border/70 transition-colors hover:border-primary/50" onClick={onClick}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <Avatar className="size-12 rounded-2xl">
          <AvatarImage src={`https://robohash.org/${agent.id}?set=set1&size=96x96`} alt={agent.name} />
          <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className={cn('mt-1 size-2 rounded-full', statusClass(agent.status), agent.status === 'busy' && 'uss-status-busy')} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="truncate font-heading text-lg font-semibold">{agent.name}</div>
          <div className="truncate text-sm text-muted-foreground">{agent.role}</div>
        </div>
        <Badge variant="secondary" className="max-w-full truncate font-mono">
          {agent.model.name}
        </Badge>
      </CardContent>
    </Card>
  )
}

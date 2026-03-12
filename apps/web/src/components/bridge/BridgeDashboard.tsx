'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BridgeResponse } from '@uss/shared'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader, SectionCard } from '@/components/app/page-shell'
import { AgentCard } from './AgentCard'
import { HealthPanel } from './HealthPanel'
import { TaskRunRow } from './TaskRunRow'
import { UsageTile } from './UsageTile'

export function BridgeDashboard({ data }: { data: BridgeResponse }) {
  const router = useRouter()

  return (
    <PageContainer size="wide">
      <PageHeader eyebrow="Command" title="Bridge" description="Fleet status, task velocity, and system health from a single surface." />

      <SectionCard
        title="Fleet Status"
        description="Connected agents and their current focus."
        action={
          <Button variant="ghost" size="sm" onClick={() => router.push('/agents')}>
            View all
            <ArrowRight data-icon="inline-end" />
          </Button>
        }
      >
        {data.agents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
            No agents connected.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => router.push(`/agents/${encodeURIComponent(agent.id)}`)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <SectionCard
          title="Recent Tasks"
          description="Latest task executions flowing through the bridge."
          action={
            <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')}>
              View all
              <ArrowRight data-icon="inline-end" />
            </Button>
          }
        >
          {data.recentTaskRuns.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">No recent task runs.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {data.recentTaskRuns.slice(0, 8).map((run, idx) => (
                <TaskRunRow
                  key={run.id}
                  run={run}
                  isLast={idx === Math.min(data.recentTaskRuns.length, 8) - 1}
                  onClick={() => router.push('/tasks')}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="System Health" description="Gateway, providers, and recent errors.">
          <HealthPanel health={data.systemHealth} />
        </SectionCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UsageTile label="Today" period={data.usageSnapshot.today} onClick={() => router.push('/usage')} />
        <UsageTile label="This Week" period={data.usageSnapshot.thisWeek} onClick={() => router.push('/usage')} />
      </div>
    </PageContainer>
  )
}

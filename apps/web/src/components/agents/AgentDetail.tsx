'use client'

import { ArrowLeft, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AgentDetailPayload, AgentModel, AgentTaskStatus } from '@uss/shared'
import { MetricCard, PageContainer, PageHeader, SectionCard } from '@/components/app/page-shell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
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

function taskStatusIcon(status: AgentTaskStatus) {
  if (status === 'running') return <Loader2 className="size-4 animate-spin text-primary" />
  if (status === 'completed') return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === 'failed') return <XCircle className="size-4 text-destructive" />
  return <Clock className="size-4 text-muted-foreground" />
}

function statusClass(status: AgentDetailPayload['status']) {
  if (status === 'busy') return 'bg-amber-500'
  if (status === 'error') return 'bg-destructive'
  return 'bg-emerald-500'
}

function MarkdownContent({ content }: { content: string }) {
  const lines = useMemo(() => content.split('\n'), [content])

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return <h3 key={index} className="font-heading text-lg font-semibold">{line.slice(2)}</h3>
        }

        if (line.startsWith('## ')) {
          return <div key={index} className="pt-3 font-heading text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{line.slice(3)}</div>
        }

        if (line.startsWith('- ')) {
          return <div key={index} className="text-sm text-muted-foreground">• {line.slice(2)}</div>
        }

        if (line.trim() === '') {
          return <div key={index} className="h-2" />
        }

        return <p key={index} className="text-sm leading-6 text-muted-foreground">{line}</p>
      })}
    </div>
  )
}

export function AgentDetail({
  agent,
  availableModels,
  isMutatingModel,
  onBack,
  onChangeModel,
  onViewTasks,
}: {
  agent: AgentDetailPayload
  availableModels: AgentModel[]
  isMutatingModel?: boolean
  onBack?: () => void
  onChangeModel?: (agentId: string, modelId: string) => void
  onViewTasks?: (agentId: string) => void
}) {
  const [selectedDoc, setSelectedDoc] = useState(agent.configDocs[0]?.filename ?? '')
  const selectedContent = agent.configDocs.find((doc) => doc.filename === selectedDoc)?.content ?? ''
  const enabledSkills = agent.skills.filter((skill) => skill.enabled)

  return (
    <PageContainer>
      <Button variant="ghost" className="w-fit px-0" onClick={onBack}>
        <ArrowLeft data-icon="inline-start" />
        Agents
      </Button>

      <PageHeader
        eyebrow="Agent"
        title={agent.name}
        description={agent.role}
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground sm:flex">
              <span className={cn('size-2 rounded-full', statusClass(agent.status), agent.status === 'busy' && 'uss-status-busy')} />
              <span className="capitalize">{agent.status}</span>
            </div>
            <Select
              value={agent.model.id}
              onValueChange={(value) => onChangeModel?.(agent.id, value)}
              disabled={isMutatingModel}
            >
              <SelectTrigger className="w-[220px] font-mono">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex items-start gap-4 rounded-3xl border border-border/70 bg-card px-6 py-5 shadow-sm">
        <Avatar className="size-16 rounded-2xl">
          <AvatarImage src={`https://robohash.org/${agent.id}?set=set1&size=112x112`} alt={agent.name} />
          <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="font-heading text-xl font-semibold">{agent.name}</div>
          <div className="text-sm text-muted-foreground">{agent.role}</div>
          <Badge variant="secondary" className="font-mono">{agent.model.name}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tasks" value={agent.recentTasks.length} detail="recent runs" />
        <MetricCard label="Skills" value={enabledSkills.length} detail={`of ${agent.skills.length} enabled`} />
        <MetricCard label="Cost" value={`$${agent.usageSummary.costUsd.toFixed(2)}`} detail="this period" />
        <MetricCard label="Tokens" value={formatTokens(agent.usageSummary.tokens)} detail={`${agent.usageSummary.conversations} conversations`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent Tasks"
          description="Latest work executed by this agent."
          action={<Button variant="ghost" size="sm" onClick={() => onViewTasks?.(agent.id)}>View all</Button>}
        >
          {agent.recentTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent tasks.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {agent.recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {taskStatusIcon(task.status)}
                    <div className="truncate text-sm text-foreground">{task.title}</div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{relativeTime(task.ranAt)}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Skills" description="Enabled capabilities and switches.">
          {agent.skills.length === 0 ? (
            <div className="text-sm text-muted-foreground">No skills configured.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {agent.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-4 py-3">
                  <div className={cn('text-sm', !skill.enabled && 'text-muted-foreground')}>{skill.name}</div>
                  <Badge variant={skill.enabled ? 'default' : 'secondary'}>{skill.enabled ? 'ON' : 'OFF'}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Configuration" description="Rendered configuration docs and agent notes.">
        {agent.configDocs.length === 0 ? (
          <div className="text-sm text-muted-foreground">No config docs.</div>
        ) : (
          <Tabs defaultValue={agent.configDocs[0]?.filename} value={selectedDoc} onValueChange={setSelectedDoc} className="gap-4">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-2xl bg-muted/70 p-1">
              {agent.configDocs.map((doc) => (
                <TabsTrigger key={doc.filename} value={doc.filename} className="font-mono text-xs">
                  {doc.filename}
                </TabsTrigger>
              ))}
            </TabsList>
            {agent.configDocs.map((doc) => (
              <TabsContent key={doc.filename} value={doc.filename}>
                <ScrollArea className="h-[420px] rounded-2xl border border-border/70 bg-muted/15 p-5">
                  {selectedContent ? <MarkdownContent content={doc.content} /> : null}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </SectionCard>
    </PageContainer>
  )
}

import type { BridgeResponse } from '@uss/shared'
import type { ActivityEvent, EventStatus } from './types'

function mapTaskStatusToEventStatus(status: 'running' | 'completed' | 'failed' | 'scheduled'): EventStatus {
  if (status === 'running') return 'running'
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'failed'
  return 'info'
}

function inferOpenClawEventStatus(status: BridgeResponse['systemHealth']['openclaw']['status']): EventStatus {
  if (status === 'running') return 'success'
  if (status === 'error') return 'failed'
  return 'info'
}

export function mapBridgeToActivityModel(data: BridgeResponse): { events: ActivityEvent[]; agents: { id: string; name: string }[] } {
  const events: ActivityEvent[] = []

  for (const run of data.recentTaskRuns) {
    events.push({
      id: `task-${run.id}`,
      agentId: run.agentId,
      agentName: run.agentName,
      eventType: 'task_run',
      description: run.error ? `${run.taskName} - ${run.error}` : run.taskName,
      status: mapTaskStatusToEventStatus(run.status),
      occurredAt: run.completedAt ?? run.startedAt,
    })
  }

  for (const err of data.systemHealth.recentErrors) {
    events.push({
      id: `system-error-${err.id}`,
      agentId: err.agentId ?? 'system',
      agentName: err.agentName ?? 'System',
      eventType: 'system',
      description: err.taskName ? `${err.taskName} - ${err.message}` : err.message,
      status: err.level === 'error' ? 'failed' : 'info',
      occurredAt: err.occurredAt,
    })
  }

  events.push({
    id: 'system-openclaw-status',
    agentId: 'system',
    agentName: 'System',
    eventType: 'system',
    description: `OpenClaw ${data.systemHealth.openclaw.status} (v${data.systemHealth.openclaw.version})`,
    status: inferOpenClawEventStatus(data.systemHealth.openclaw.status),
    occurredAt: new Date().toISOString(),
  })

  for (const provider of data.systemHealth.providers) {
    const status: EventStatus = provider.status === 'down' ? 'failed' : provider.status === 'degraded' ? 'info' : 'success'
    events.push({
      id: `system-provider-${provider.id}`,
      agentId: 'system',
      agentName: 'System',
      eventType: 'system',
      description: `Provider ${provider.name} is ${provider.status}`,
      status,
      occurredAt: new Date().toISOString(),
    })
  }

  return {
    events,
    agents: data.agents.map((agent) => ({ id: agent.id, name: agent.name })),
  }
}

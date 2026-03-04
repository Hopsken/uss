export type EventType = 'task_run' | 'skill_invoked' | 'conversation' | 'system'

export type EventStatus = 'success' | 'failed' | 'running' | 'info'

export interface AgentRef {
  id: string
  name: string
}

export interface ActivityEvent {
  id: string
  agentId: string
  agentName: string
  eventType: EventType
  description: string
  status: EventStatus
  occurredAt: string
}

export interface ActivityProps {
  events: ActivityEvent[]
  agents: AgentRef[]
  activeAgentId?: string | null
  activeEventType?: EventType | null
  onFilterByAgent?: (agentId: string | null) => void
  onFilterByType?: (eventType: EventType | null) => void
}

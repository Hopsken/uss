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
  occurredAt: string // ISO 8601
}

export interface ActivityProps {
  events: ActivityEvent[]
  agents: AgentRef[]
  /** Currently active agent filter (null = all agents) */
  activeAgentId?: string | null
  /** Currently active event type filter (null = all types) */
  activeEventType?: EventType | null
  /** Called when user selects an agent filter (null to clear) */
  onFilterByAgent?: (agentId: string | null) => void
  /** Called when user selects an event type filter (null to clear) */
  onFilterByType?: (eventType: EventType | null) => void
}

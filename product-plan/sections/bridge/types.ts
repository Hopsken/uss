export type AgentStatus = 'idle' | 'busy' | 'error'
export type TaskRunStatus = 'running' | 'completed' | 'failed' | 'scheduled'
export type ProviderStatus = 'healthy' | 'degraded' | 'down'
export type ErrorLevel = 'error' | 'warning'
export type OpenClawStatus = 'running' | 'stopped' | 'error'

export interface Agent {
  id: string
  name: string
  role: string
  avatarUrl: string | null
  model: string
  status: AgentStatus
  currentTask: string | null
}

export interface RecentTaskRun {
  id: string
  taskName: string
  agentId: string
  agentName: string
  status: TaskRunStatus
  startedAt: string
  completedAt: string | null
  error: string | null
}

export interface Provider {
  id: string
  name: string
  status: ProviderStatus
  latencyMs: number
  models: string[]
}

export interface ErrorEvent {
  id: string
  level: ErrorLevel
  message: string
  agentId: string | null
  agentName: string | null
  taskName: string | null
  occurredAt: string
}

export interface SystemHealth {
  openclaw: {
    status: OpenClawStatus
    uptimeSeconds: number
    version: string
  }
  providers: Provider[]
  recentErrors: ErrorEvent[]
}

export interface UsagePeriod {
  costUsd: number
  tokens: number
  conversations: number
}

export interface UsageSnapshot {
  today: UsagePeriod
  thisWeek: UsagePeriod
}

export interface BridgeProps {
  agents: Agent[]
  recentTaskRuns: RecentTaskRun[]
  systemHealth: SystemHealth
  usageSnapshot: UsageSnapshot
  /** Navigate to the Agents section */
  onViewAgents?: () => void
  /** Navigate to a specific agent's detail */
  onViewAgent?: (agentId: string) => void
  /** Navigate to the Tasks section */
  onViewTasks?: () => void
  /** Navigate to a specific task run */
  onViewTaskRun?: (taskRunId: string) => void
  /** Navigate to the Usage section */
  onViewUsage?: () => void
}

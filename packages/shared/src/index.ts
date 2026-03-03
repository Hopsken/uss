export type HealthResponse = {
  status: 'ok'
  service: 'api'
  timestamp: string
}

export type AgentStatus = 'idle' | 'busy' | 'error'
export type TaskRunStatus = 'running' | 'completed' | 'failed' | 'scheduled'
export type ProviderStatus = 'healthy' | 'degraded' | 'down'
export type ErrorLevel = 'error' | 'warning'
export type OpenClawStatus = 'running' | 'stopped' | 'error'

export type BridgeAgent = {
  id: string
  name: string
  role: string
  avatarUrl: string | null
  model: string
  status: AgentStatus
  currentTask: string | null
}

export type RecentTaskRun = {
  id: string
  taskName: string
  agentId: string
  agentName: string
  status: TaskRunStatus
  startedAt: string
  completedAt: string | null
  error: string | null
}

export type Provider = {
  id: string
  name: string
  status: ProviderStatus
  latencyMs: number
  models: string[]
}

export type ErrorEvent = {
  id: string
  level: ErrorLevel
  message: string
  agentId: string | null
  agentName: string | null
  taskName: string | null
  occurredAt: string
}

export type SystemHealth = {
  openclaw: {
    status: OpenClawStatus
    uptimeSeconds: number
    version: string
  }
  providers: Provider[]
  recentErrors: ErrorEvent[]
}

export type UsagePeriod = {
  costUsd: number
  tokens: number
  conversations: number
}

export type UsageSnapshot = {
  today: UsagePeriod
  thisWeek: UsagePeriod
}

export type BridgeResponse = {
  agents: BridgeAgent[]
  recentTaskRuns: RecentTaskRun[]
  systemHealth: SystemHealth
  usageSnapshot: UsageSnapshot
}

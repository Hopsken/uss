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

export type AgentTaskStatus = 'running' | 'completed' | 'failed' | 'scheduled'

export type AgentModel = {
  id: string
  name: string
}

export type AgentTaskHistoryItem = {
  id: string
  title: string
  status: AgentTaskStatus
  ranAt: string
}

export type AgentSkillSummary = {
  id: string
  name: string
  enabled: boolean
}

export type AgentUsageSummary = {
  tokens: number
  costUsd: number
  conversations: number
}

export type AgentConfigDoc = {
  filename: string
  content: string
}

export type AgentListItem = {
  id: string
  name: string
  role: string
  status: AgentStatus
  model: AgentModel
}

export type AgentDetailPayload = {
  id: string
  name: string
  role: string
  status: AgentStatus
  model: AgentModel
  usageSummary: AgentUsageSummary
  recentTasks: AgentTaskHistoryItem[]
  skills: AgentSkillSummary[]
  configDocs: AgentConfigDoc[]
}

export type AgentsListResponse = {
  agents: AgentListItem[]
  availableModels: AgentModel[]
  syncedAt: string
}

export type AgentDetailResponse = {
  agent: AgentDetailPayload
  availableModels: AgentModel[]
  syncedAt: string
}

export type UpdateAgentModelRequest = {
  modelId: string
}

export type UpdateAgentModelResponse = {
  ok: true
  agentId: string
  modelId: string
  syncedAt: string
}

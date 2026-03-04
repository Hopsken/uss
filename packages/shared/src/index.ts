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

export type UsageDateMode = 'utc' | 'gateway' | 'specific'

export type UsageQuery = {
  startDate: string
  endDate: string
  mode?: UsageDateMode
  utcOffset?: string
}

export type UsageSummary = {
  totalCost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

export type TimeSeriesPoint = {
  date: string
  cost: number
  tokens: number
}

export type AgentUsage = {
  agentId: string
  agentName: string
  cost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

export type ModelUsage = {
  modelId: string
  modelName: string
  cost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

export type UsageResponse = {
  startDate: string
  endDate: string
  summary: UsageSummary
  timeSeries: TimeSeriesPoint[]
  agents: AgentUsage[]
  modelBreakdown: ModelUsage[]
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

export type SkillCategory =
  | 'web'
  | 'calendar'
  | 'communication'
  | 'code'
  | 'notes'
  | 'productivity'
  | 'system'

export type ConfigStatus = 'configured' | 'needs_setup'

export type SkillConfig = {
  key: string
  label: string
  value: string
  isSecret: boolean
}

export type Skill = {
  id: string
  name: string
  description: string
  category: SkillCategory
  isEnabled: boolean
  configStatus: ConfigStatus
  lastUsedAt: string | null
  config: SkillConfig[]
  instructions?: string
}

export type AgentSkillGroup = {
  agentId: string
  agentName: string
  skills: Skill[]
}

export type SkillsProps = {
  systemSkills: Skill[]
  agentGroups: AgentSkillGroup[]
  selectedSkillId?: string | null
  selectedAgentId?: string | null
  onToggleSkill?: (skillId: string, agentId: string | null, enabled: boolean) => void
  onSelectSkill?: (skillId: string, agentId: string | null) => void
  onClosePanel?: () => void
  onSaveConfig?: (skillId: string, agentId: string | null, config: SkillConfig[]) => void
  onAssignSkill?: (skillId: string, targetAgentId: string) => void
}

export type SkillsResponse = {
  systemSkills: Skill[]
  agentGroups: AgentSkillGroup[]
  syncedAt: string
}

export type ToggleSkillRequest = {
  agentId: string | null
  enabled: boolean
}

export type ToggleSkillResponse = {
  ok: true
  skillId: string
  agentId: string | null
  enabled: boolean
  syncedAt: string
}

export type SaveSkillConfigRequest = {
  agentId: string | null
  config: SkillConfig[]
}

export type SaveSkillConfigResponse = {
  ok: true
  skillId: string
  agentId: string | null
  config: SkillConfig[]
  syncedAt: string
}

export type AssignSkillRequest = {
  sourceAgentId: string | null
  targetAgentId: string
}

export type AssignSkillResponse = {
  ok: true
  skillId: string
  sourceAgentId: string | null
  targetAgentId: string
  applied: boolean
  reason: string | null
  syncedAt: string
}

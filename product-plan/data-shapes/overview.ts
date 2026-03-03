// =============================================================================
// UI Data Shapes — Combined Reference
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data is an implementation decision.
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/bridge
// -----------------------------------------------------------------------------

export type AgentStatusBridge = 'idle' | 'busy' | 'error'
export type TaskRunStatus = 'running' | 'completed' | 'failed' | 'scheduled'
export type ProviderStatus = 'healthy' | 'degraded' | 'down'
export type ErrorLevel = 'error' | 'warning'
export type OpenClawStatus = 'running' | 'stopped' | 'error'

export interface BridgeAgent {
  id: string
  name: string
  role: string
  avatarUrl: string | null
  model: string
  status: AgentStatusBridge
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

// -----------------------------------------------------------------------------
// From: sections/agents
// -----------------------------------------------------------------------------

export type AgentStatus = 'idle' | 'busy' | 'error'
export type AgentTaskStatus = 'running' | 'completed' | 'failed' | 'scheduled'

export interface AgentModel {
  id: string
  name: string
}

export interface TaskHistoryItem {
  id: string
  title: string
  status: AgentTaskStatus
  ranAt: string
}

export interface SkillSummary {
  id: string
  name: string
  enabled: boolean
}

export interface AgentUsageSummary {
  tokens: number
  costUsd: number
  conversations: number
}

export interface ConfigDoc {
  filename: string
  content: string
}

export interface Agent {
  id: string
  name: string
  role: string
  status: AgentStatus
  model: AgentModel
  usageSummary: AgentUsageSummary
  recentTasks: TaskHistoryItem[]
  skills: SkillSummary[]
  configDocs: ConfigDoc[]
}

// -----------------------------------------------------------------------------
// From: sections/tasks
// -----------------------------------------------------------------------------

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed' | 'cancelled'
export type KanbanView = 'by_agent' | 'by_status'
export type SchedulePreset = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type ChangelogEntryType =
  | 'task_created'
  | 'status_changed'
  | 'agent_assigned'
  | 'task_updated'
  | 'run_triggered'

export interface TaskSchedule {
  type: 'one_time' | 'recurring'
  scheduledAt?: string
  preset?: SchedulePreset
  cronExpression?: string
  humanReadable: string
}

export interface ChangelogEntry {
  id: string
  type: ChangelogEntryType
  message: string
  detail: string
  occurredAt: string
}

export interface Task {
  id: string
  title: string
  instructions: string
  agentId: string
  agentName: string
  agentRole: string
  status: TaskStatus
  schedule: TaskSchedule
  createdAt: string
  updatedAt: string
  completedAt: string | null
  templateId: string | null
  changelog: ChangelogEntry[]
  executionLog: string | null
}

export interface TaskTemplate {
  id: string
  name: string
  description: string
  defaultInstructions: string
  suggestedAgentId?: string
}

export interface AgentPreInstructions {
  agentId: string
  agentName: string
  agentRole: string
  instructions: string
  updatedAt: string
}

export interface AgentRef {
  id: string
  name: string
  role: string
}

// -----------------------------------------------------------------------------
// From: sections/activity
// -----------------------------------------------------------------------------

export type EventType = 'task_run' | 'skill_invoked' | 'conversation' | 'system'
export type EventStatus = 'success' | 'failed' | 'running' | 'info'

export interface ActivityEvent {
  id: string
  agentId: string
  agentName: string
  eventType: EventType
  description: string
  status: EventStatus
  occurredAt: string
}

// -----------------------------------------------------------------------------
// From: sections/usage
// -----------------------------------------------------------------------------

export type TimeRange = 'this_week' | 'this_month' | 'last_month' | 'all_time'

export interface UsageSummary {
  totalCost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

export interface TimeSeriesPoint {
  date: string
  cost: number
  tokens: number
}

export interface AgentUsage {
  agentId: string
  agentName: string
  cost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

export interface ModelUsage {
  modelId: string
  modelName: string
  cost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

// -----------------------------------------------------------------------------
// From: sections/skills
// -----------------------------------------------------------------------------

export type SkillCategory = 'web' | 'calendar' | 'communication' | 'code' | 'notes' | 'productivity' | 'system'
export type ConfigStatus = 'configured' | 'needs_setup'

export interface SkillConfig {
  key: string
  label: string
  value: string
  isSecret: boolean
}

export interface Skill {
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

export interface AgentSkillGroup {
  agentId: string
  agentName: string
  skills: Skill[]
}

export type AgentStatus = 'idle' | 'busy' | 'error'

export type TaskStatus = 'running' | 'completed' | 'failed' | 'scheduled'

export interface AgentModel {
  id: string
  name: string
}

export interface TaskHistoryItem {
  id: string
  title: string
  status: TaskStatus
  ranAt: string // ISO 8601
}

export interface SkillSummary {
  id: string
  name: string
  enabled: boolean
}

export interface UsageSummary {
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
  usageSummary: UsageSummary
  recentTasks: TaskHistoryItem[]
  skills: SkillSummary[]
  configDocs: ConfigDoc[]
}

// ---- List View Props ----

export interface AgentsListProps {
  agents: Agent[]
  isSyncing?: boolean
  /** Navigate to agent detail page */
  onSelectAgent?: (agentId: string) => void
  /** Trigger sync from OpenClaw */
  onSync?: () => void
}

// ---- Detail View Props ----

export interface AgentDetailProps {
  agent: Agent
  availableModels: AgentModel[]
  /** Navigate back to agent list */
  onBack?: () => void
  /** Change the model assigned to this agent */
  onChangeModel?: (agentId: string, modelId: string) => void
  /** Navigate to tasks filtered by this agent */
  onViewTasks?: (agentId: string) => void
}

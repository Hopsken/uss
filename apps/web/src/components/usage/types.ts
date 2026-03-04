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

export interface UsageRangeOption {
  value: string
  label: string
}

export interface UsageProps {
  summary: UsageSummary
  timeSeries: TimeSeriesPoint[]
  agents: AgentUsage[]
  modelBreakdown: ModelUsage[]
  activeTimeRange: string
  timeRangeOptions: UsageRangeOption[]
  onTimeRangeChange?: (range: string) => void
}

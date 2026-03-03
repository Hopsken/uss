export type TimeRange = 'this_week' | 'this_month' | 'last_month' | 'all_time'

export interface UsageSummary {
  totalCost: number
  totalTokens: number
  conversationCount: number
  taskRunCount: number
}

export interface TimeSeriesPoint {
  /** ISO date string, e.g. "2026-03-03" */
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

export interface UsageProps {
  summary: UsageSummary
  timeSeries: TimeSeriesPoint[]
  agents: AgentUsage[]
  modelBreakdown: ModelUsage[]
  activeTimeRange: TimeRange
  /** Called when the user selects a different time range tab */
  onTimeRangeChange?: (range: TimeRange) => void
}

import type { UsageQuery } from '@uss/shared'

export const queryKeys = {
  activity: {
    feed: ['activity', 'feed'] as const,
  },
  agents: {
    list: ['agents', 'list'] as const,
    detail: (agentId: string) => ['agents', 'detail', agentId] as const,
  },
  usage: {
    dashboard: (query: UsageQuery) =>
      ['usage', 'dashboard', query.startDate, query.endDate, query.mode ?? 'gateway', query.utcOffset ?? ''] as const,
  },
  tasks: {
    dashboard: (agentId?: string) => ['tasks', 'dashboard', agentId ?? 'all'] as const,
    runs: (taskId: string) => ['tasks', 'runs', taskId] as const,
  },
  skills: {
    list: ['skills', 'list'] as const,
  },
}

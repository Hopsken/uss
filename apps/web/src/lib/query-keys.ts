export const queryKeys = {
  activity: {
    feed: ['activity', 'feed'] as const,
  },
  agents: {
    list: ['agents', 'list'] as const,
    detail: (agentId: string) => ['agents', 'detail', agentId] as const,
  },
}

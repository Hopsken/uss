export const queryKeys = {
  agents: {
    list: ['agents', 'list'] as const,
    detail: (agentId: string) => ['agents', 'detail', agentId] as const,
  },
}

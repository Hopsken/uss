import type { BridgeResponse } from '@uss/shared'
import { fetchBridgeData } from '@/lib/api'

export type ActivityFeedSource = 'http' | 'ws'

export interface ActivityFeedAdapter {
  source: ActivityFeedSource
  getSnapshot: () => Promise<BridgeResponse>
  subscribe?: (onEvent: (event: BridgeResponse) => void) => () => void
}

export const activityHttpFeedAdapter: ActivityFeedAdapter = {
  source: 'http',
  getSnapshot: fetchBridgeData,
}

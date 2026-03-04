import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { UsageClient } from '@/components/usage'
import { DEFAULT_USAGE_RANGE, resolveRangeQuery } from '@/components/usage/range'
import { fetchUsageServer } from '@/lib/api-server'
import { queryKeys } from '@/lib/query-keys'
import { getQueryClient } from '@/lib/react-query'

export default async function UsagePage() {
  const queryClient = getQueryClient()
  const initialRange = DEFAULT_USAGE_RANGE
  const initialRangeQuery = resolveRangeQuery(initialRange, new Date())

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.usage.dashboard(initialRangeQuery),
      queryFn: () => fetchUsageServer(initialRangeQuery),
    })
  } catch {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsageClient initialRange={initialRange} initialRangeQuery={initialRangeQuery} />
    </HydrationBoundary>
  )
}

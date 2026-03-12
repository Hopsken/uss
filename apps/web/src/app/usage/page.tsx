import { UsageClient } from '@/components/usage'
import { DEFAULT_USAGE_RANGE } from '@/components/usage/range'

export default function UsagePage() {
  return <UsageClient initialRange={DEFAULT_USAGE_RANGE} />
}

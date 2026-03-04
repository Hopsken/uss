import type { UsageQuery } from '@uss/shared'

export const DEFAULT_USAGE_RANGE = 'this_week'

export const RANGE_OPTIONS = [
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'all_time', label: 'All time' },
]

function formatIsoDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfWeekMonday(now: Date): Date {
  const d = new Date(now)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + diff)
  return d
}

export function resolveRangeQuery(range: string, now: Date = new Date()): UsageQuery {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (range === 'this_week') {
    return {
      startDate: formatIsoDateLocal(startOfWeekMonday(today)),
      endDate: formatIsoDateLocal(today),
      mode: 'gateway',
    }
  }

  if (range === 'this_month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      startDate: formatIsoDateLocal(monthStart),
      endDate: formatIsoDateLocal(today),
      mode: 'gateway',
    }
  }

  if (range === 'last_month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)

    return {
      startDate: formatIsoDateLocal(start),
      endDate: formatIsoDateLocal(end),
      mode: 'gateway',
    }
  }

  return {
    startDate: '1970-01-01',
    endDate: formatIsoDateLocal(today),
    mode: 'gateway',
  }
}

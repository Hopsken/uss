'use client'

import { Badge, Box, Group, Text } from '@mantine/core'
import { CheckCircle2, Clock, Loader2, X } from 'lucide-react'
import type { RecentTaskRun, TaskRunStatus } from '@uss/shared'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function StatusIcon({ status }: { status: TaskRunStatus }) {
  if (status === 'running')
    return <Loader2 size={14} color="var(--mantine-color-sky-5)" style={{ animation: 'spin 1s linear infinite' }} />
  if (status === 'completed')
    return <CheckCircle2 size={14} color="var(--mantine-color-green-6)" />
  if (status === 'failed')
    return <X size={14} color="var(--mantine-color-red-5)" />
  return <Clock size={14} color="var(--mantine-color-gray-5)" />
}

interface Props {
  run: RecentTaskRun
  isLast: boolean
  onClick: () => void
}

export function TaskRunRow({ run, isLast, onClick }: Props) {
  return (
    <Box
      px="md"
      py="sm"
      style={{
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--mantine-color-gray-2)',
      }}
      onClick={onClick}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap" gap="xs">
          <StatusIcon status={run.status} />
          <Box>
            <Text size="sm" fw={500} lineClamp={1}>{run.taskName}</Text>
            {run.error && (
              <Text size="xs" c="red.6" lineClamp={1}>{run.error}</Text>
            )}
          </Box>
        </Group>
        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Badge variant="light" color="sky" size="xs">{run.agentName}</Badge>
          <Text size="xs" c="dimmed" ff="var(--font-mono)" style={{ whiteSpace: 'nowrap' }}>
            {relativeTime(run.startedAt)}
          </Text>
        </Group>
      </Group>
    </Box>
  )
}

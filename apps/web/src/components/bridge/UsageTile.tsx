'use client'

import { Box, Card, Group, Text } from '@mantine/core'
import type { UsagePeriod } from '@uss/shared'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${n}`
}

interface Props {
  label: string
  period: UsagePeriod
  onClick: () => void
}

export function UsageTile({ label, period, onClick }: Props) {
  return (
    <Card
      withBorder
      radius="lg"
      style={{ cursor: 'pointer' }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--mantine-color-sky-5)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = ''
      }}
      onClick={onClick}
    >
      <Text size="xs" fw={700} tt="uppercase" c="slate.6" ff="var(--font-heading)">
        {label}
      </Text>
      <Text ff="var(--font-mono)" fw={700} size="xl" mt="xs">
        ${period.costUsd.toFixed(2)}
      </Text>
      <Group mt="sm" gap="xl">
        <Box>
          <Text size="xs" c="dimmed">Tokens</Text>
          <Text ff="var(--font-mono)" size="sm">{formatTokens(period.tokens)}</Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">Conversations</Text>
          <Text ff="var(--font-mono)" size="sm">{period.conversations}</Text>
        </Box>
      </Group>
    </Card>
  )
}

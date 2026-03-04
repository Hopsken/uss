'use client'

import { Avatar, Badge, Box, Card, Group, Text } from '@mantine/core'
import type { AgentListItem } from '@uss/shared'

function StatusDot({ status }: { status: AgentListItem['status'] }) {
  const color =
    status === 'busy'
      ? 'var(--mantine-color-amber-5)'
      : status === 'error'
        ? 'var(--mantine-color-red-5)'
        : 'var(--mantine-color-gray-4)'

  return (
    <Box
      w={8}
      h={8}
      style={{ borderRadius: '50%', background: color, flexShrink: 0 }}
      className={status === 'busy' ? 'uss-status-busy' : undefined}
    />
  )
}

export function AgentCard({
  agent,
  onClick,
}: {
  agent: AgentListItem
  onClick?: () => void
}) {
  return (
    <Card
      withBorder
      radius="md"
      p="md"
      style={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}
      onClick={onClick}
    >
      <Group justify="space-between" align="flex-start" mb="sm">
        <Avatar
          src={`https://robohash.org/${agent.id}?set=set1&size=96x96`}
          radius="xl"
          size={48}
        />
        <StatusDot status={agent.status} />
      </Group>

      <Text fw={700} ff="var(--font-heading)" lineClamp={1}>
        {agent.name}
      </Text>
      <Text size="sm" c="dimmed" lineClamp={1}>
        {agent.role}
      </Text>

      <Badge mt="sm" variant="light" color="gray" ff="var(--font-mono)" tt="none">
        {agent.model.name}
      </Badge>
    </Card>
  )
}

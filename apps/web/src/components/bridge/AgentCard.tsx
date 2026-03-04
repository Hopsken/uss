'use client'

import { Avatar, Badge, Box, Card, Text } from '@mantine/core'
import type { BridgeAgent } from '@uss/shared'

function StatusDot({ status }: { status: BridgeAgent['status'] }) {
  const color =
    status === 'busy' ? 'var(--mantine-color-sky-5)' :
    status === 'error' ? 'var(--mantine-color-red-5)' :
    'var(--mantine-color-gray-4)'

  return (
    <Box
      w={8}
      h={8}
      style={{ borderRadius: '50%', background: color, flexShrink: 0 }}
      className={status === 'busy' ? 'uss-status-busy' : undefined}
    />
  )
}

interface Props {
  agent: BridgeAgent
  onClick: () => void
}

export function AgentCard({ agent, onClick }: Props) {
  const robohash = `https://robohash.org/${agent.id}?set=set1&size=80x80`

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      w={176}
      style={{ cursor: 'pointer', flexShrink: 0 }}
      styles={{
        root: {
          transition: 'border-color 0.15s',
        },
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--mantine-color-sky-5)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = ''
      }}
      onClick={onClick}
    >
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Avatar
          src={agent.avatarUrl ?? robohash}
          radius="xl"
          size={40}
        />
        <StatusDot status={agent.status} />
      </Box>

      <Text fw={600} size="sm" lineClamp={1}>{agent.name}</Text>
      <Text size="xs" c="dimmed" lineClamp={1}>{agent.role}</Text>

      <Badge
        mt={6}
        variant="light"
        color="gray"
        ff="var(--font-mono)"
        size="xs"
        style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {agent.model}
      </Badge>

      {agent.currentTask && (
        <Text mt={4} size="xs" c="sky.6" lineClamp={1}>
          ↳ {agent.currentTask}
        </Text>
      )}
    </Card>
  )
}

'use client'

import { Alert, Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { RefreshCw } from 'lucide-react'
import type { AgentListItem } from '@uss/shared'
import { AgentCard } from './AgentCard'

export function AgentsList({
  agents,
  isSyncing,
  onSelectAgent,
  onSync,
  error,
}: {
  agents: AgentListItem[]
  isSyncing?: boolean
  onSelectAgent?: (agentId: string) => void
  onSync?: () => void
  error?: string | null
}) {
  const busyCount = agents.filter((agent) => agent.status === 'busy').length
  const errorCount = agents.filter((agent) => agent.status === 'error').length

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} ff="var(--font-heading)">
              Agents
            </Title>
            <Group gap="sm" mt={4}>
              <Text size="sm" c="dimmed">
                {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
              </Text>
              {busyCount > 0 && (
                <Text size="xs" c="amber.7">
                  {busyCount} busy
                </Text>
              )}
              {errorCount > 0 && (
                <Text size="xs" c="red.7">
                  {errorCount} error
                </Text>
              )}
            </Group>
          </Box>

          <Button
            variant="light"
            leftSection={<RefreshCw size={14} className={isSyncing ? 'uss-status-busy' : undefined} />}
            loading={isSyncing}
            onClick={onSync}
          >
            Sync from OpenClaw
          </Button>
        </Group>

        {error && <Alert color="red">{error}</Alert>}

        {agents.length === 0 ? (
          <Paper withBorder radius="md" p="xl">
            <Stack align="center" gap="xs">
              <Text fw={600} ff="var(--font-heading)">
                No agents found
              </Text>
              <Text size="sm" c="dimmed">
                Sync from OpenClaw to load your crew.
              </Text>
              <Button mt="sm" onClick={onSync} loading={isSyncing}>
                Sync from OpenClaw
              </Button>
            </Stack>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onClick={() => onSelectAgent?.(agent.id)} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  )
}

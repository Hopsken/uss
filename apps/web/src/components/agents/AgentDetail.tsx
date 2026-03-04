'use client'

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Menu,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AgentDetailPayload, AgentModel, AgentTaskStatus } from '@uss/shared'

function statusColor(status: AgentDetailPayload['status']): string {
  if (status === 'busy') return 'var(--mantine-color-amber-5)'
  if (status === 'error') return 'var(--mantine-color-red-5)'
  return 'var(--mantine-color-gray-4)'
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function taskStatusIcon(status: AgentTaskStatus): React.ReactNode {
  if (status === 'running') return <Loader2 size={14} className="uss-status-busy" />
  if (status === 'completed') return <CheckCircle2 size={14} color="var(--mantine-color-green-6)" />
  if (status === 'failed') return <XCircle size={14} color="var(--mantine-color-red-6)" />
  return <Clock size={14} color="var(--mantine-color-gray-6)" />
}

function MarkdownContent({ content }: { content: string }) {
  const lines = useMemo(() => content.split('\n'), [content])

  return (
    <Stack gap={6}>
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <Title key={index} order={3} ff="var(--font-heading)">
              {line.slice(2)}
            </Title>
          )
        }

        if (line.startsWith('## ')) {
          return (
            <Text key={index} fw={700} ff="var(--font-heading)" mt="sm">
              {line.slice(3)}
            </Text>
          )
        }

        if (line.startsWith('- ')) {
          return (
            <Text key={index} size="sm" c="dimmed">
              • {line.slice(2)}
            </Text>
          )
        }

        if (line.trim() === '') {
          return <Box key={index} h={6} />
        }

        return (
          <Text key={index} size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
            {line}
          </Text>
        )
      })}
    </Stack>
  )
}

export function AgentDetail({
  agent,
  availableModels,
  isMutatingModel,
  onBack,
  onChangeModel,
  onViewTasks,
}: {
  agent: AgentDetailPayload
  availableModels: AgentModel[]
  isMutatingModel?: boolean
  onBack?: () => void
  onChangeModel?: (agentId: string, modelId: string) => void
  onViewTasks?: (agentId: string) => void
}) {
  const [selectedDoc, setSelectedDoc] = useState(agent.configDocs[0]?.filename ?? '')
  const selectedContent = agent.configDocs.find((doc) => doc.filename === selectedDoc)?.content ?? ''
  const enabledSkills = agent.skills.filter((skill) => skill.enabled)

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="lg">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={14} />}
          onClick={onBack}
          styles={{ root: { alignSelf: 'flex-start', paddingLeft: 0 } }}
        >
          Agents
        </Button>

        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Group align="flex-start">
            <Avatar src={`https://robohash.org/${agent.id}?set=set1&size=112x112`} size={64} radius="xl" />
            <Box>
              <Title order={1} ff="var(--font-heading)">
                {agent.name}
              </Title>
              <Text c="dimmed">{agent.role}</Text>
              <Group gap={6} mt={6}>
                <Box
                  w={8}
                  h={8}
                  style={{ borderRadius: '50%', background: statusColor(agent.status) }}
                  className={agent.status === 'busy' ? 'uss-status-busy' : undefined}
                />
                <Text size="xs" c="dimmed" tt="capitalize">
                  {agent.status}
                </Text>
              </Group>
            </Box>
          </Group>

          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <Button
                variant="light"
                rightSection={<ChevronDown size={14} />}
                loading={isMutatingModel}
                ff="var(--font-mono)"
              >
                {agent.model.name}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {availableModels.map((model) => (
                <Menu.Item
                  key={model.id}
                  leftSection={model.id === agent.model.id ? <Check size={14} /> : null}
                  onClick={() => onChangeModel?.(agent.id, model.id)}
                >
                  <Stack gap={0}>
                    <Text size="sm">{model.name}</Text>
                    <Text size="xs" c="dimmed" ff="var(--font-mono)">
                      {model.id}
                    </Text>
                  </Stack>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Card withBorder>
            <Text size="xs" c="dimmed" tt="uppercase">
              Tasks
            </Text>
            <Text fw={700} ff="var(--font-mono)" size="xl">
              {agent.recentTasks.length}
            </Text>
            <Text size="xs" c="dimmed">
              recent runs
            </Text>
          </Card>
          <Card withBorder>
            <Text size="xs" c="dimmed" tt="uppercase">
              Skills
            </Text>
            <Text fw={700} ff="var(--font-mono)" size="xl">
              {enabledSkills.length}
            </Text>
            <Text size="xs" c="dimmed">
              of {agent.skills.length} enabled
            </Text>
          </Card>
          <Card withBorder>
            <Text size="xs" c="dimmed" tt="uppercase">
              Cost
            </Text>
            <Text fw={700} ff="var(--font-mono)" size="xl">
              ${agent.usageSummary.costUsd.toFixed(2)}
            </Text>
            <Text size="xs" c="dimmed">
              this period
            </Text>
          </Card>
          <Card withBorder>
            <Text size="xs" c="dimmed" tt="uppercase">
              Tokens
            </Text>
            <Text fw={700} ff="var(--font-mono)" size="xl">
              {formatTokens(agent.usageSummary.tokens)}
            </Text>
            <Text size="xs" c="dimmed">
              {agent.usageSummary.conversations} conversations
            </Text>
          </Card>
        </SimpleGrid>

        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" fw={700} ff="var(--font-heading)" tt="uppercase">
                Recent Tasks
              </Text>
              <Button variant="subtle" size="compact-sm" onClick={() => onViewTasks?.(agent.id)}>
                View all
              </Button>
            </Group>
            <Paper withBorder radius="md" p={0}>
              {agent.recentTasks.length === 0 ? (
                <Text p="md" size="sm" c="dimmed">
                  No recent tasks
                </Text>
              ) : (
                <Stack gap={0}>
                  {agent.recentTasks.map((task, index) => (
                    <Box key={task.id} px="md" py="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap">
                          {taskStatusIcon(task.status)}
                          <Text size="sm" lineClamp={1}>
                            {task.title}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed" ff="var(--font-mono)">
                          {relativeTime(task.ranAt)}
                        </Text>
                      </Group>
                      {index < agent.recentTasks.length - 1 && <Divider mt="sm" />}
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Text size="xs" c="dimmed" fw={700} ff="var(--font-heading)" tt="uppercase" mb="xs">
              Skills
            </Text>
            <Paper withBorder radius="md" p={0}>
              {agent.skills.length === 0 ? (
                <Text p="md" size="sm" c="dimmed">
                  No skills configured
                </Text>
              ) : (
                <Stack gap={0}>
                  {agent.skills.map((skill, index) => (
                    <Box key={skill.id} px="md" py="sm">
                      <Group justify="space-between">
                        <Text size="sm" c={skill.enabled ? undefined : 'dimmed'}>
                          {skill.name}
                        </Text>
                        <Badge color={skill.enabled ? 'green' : 'gray'} variant="light" size="xs">
                          {skill.enabled ? 'ON' : 'OFF'}
                        </Badge>
                      </Group>
                      {index < agent.skills.length - 1 && <Divider mt="sm" />}
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        <Box>
          <Text size="xs" c="dimmed" fw={700} ff="var(--font-heading)" tt="uppercase" mb="xs">
            Configuration
          </Text>
          <Paper withBorder radius="md" p={0} style={{ minHeight: 420 }}>
            {agent.configDocs.length === 0 ? (
              <Text p="md" size="sm" c="dimmed">
                No config docs
              </Text>
            ) : (
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <ScrollArea h={420}>
                    <Stack gap={0}>
                      {agent.configDocs.map((doc) => (
                        <Button
                          key={doc.filename}
                          variant={selectedDoc === doc.filename ? 'light' : 'subtle'}
                          justify="flex-start"
                          radius={0}
                          onClick={() => setSelectedDoc(doc.filename)}
                          ff="var(--font-mono)"
                          styles={{ root: { borderBottom: '1px solid var(--mantine-color-gray-2)' } }}
                        >
                          {doc.filename}
                        </Button>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 9 }}>
                  <ScrollArea h={420} p="md">
                    {selectedContent ? (
                      <MarkdownContent content={selectedContent} />
                    ) : (
                      <Text size="sm" c="dimmed">
                        Select a file
                      </Text>
                    )}
                  </ScrollArea>
                </Grid.Col>
              </Grid>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  )
}

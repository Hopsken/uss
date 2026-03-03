import { Card, Container, Stack, Text, Title } from '@mantine/core'

export function SectionPlaceholder({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <Container size="lg" px="md" py="xl">
      <Card radius="lg" withBorder style={{ background: '#ffffffd9', backdropFilter: 'blur(6px)' }}>
        <Stack gap="xs">
          <Title order={1} ff="Space Grotesk, system-ui, sans-serif" c="slate.9">
            {title}
          </Title>
          <Text c="slate.6">{subtitle}</Text>
          <Text c="slate.5" ff="JetBrains Mono, monospace" size="sm">
            Shell milestone placeholder
          </Text>
        </Stack>
      </Card>
    </Container>
  )
}

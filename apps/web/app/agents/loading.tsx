import { Box, Skeleton, Stack } from '@mantine/core'

export default function AgentsLoading() {
  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="lg">
        <Stack gap="xs" maw={320}>
          <Skeleton h={32} radius="sm" />
          <Skeleton h={14} radius="sm" />
        </Stack>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} h={180} radius="md" />
          ))}
        </div>
      </Stack>
    </Box>
  )
}

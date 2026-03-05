import { Box, Skeleton, Stack } from '@mantine/core'

export default function AgentDetailLoading() {
  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      <Stack gap="lg">
        <Skeleton h={20} maw={120} radius="sm" />
        <Skeleton h={88} radius="md" />
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} h={110} radius="md" />
          ))}
        </div>
        <Skeleton h={360} radius="md" />
      </Stack>
    </Box>
  )
}

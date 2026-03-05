import { Box, Skeleton, Stack } from '@mantine/core'

export default function SkillsLoading() {
  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={1280} mx="auto" h="100%">
      <Stack gap="md" h="100%" style={{ minHeight: 0 }}>
        <Stack gap="xs" maw={360}>
          <Skeleton h={32} radius="sm" />
          <Skeleton h={14} radius="sm" />
        </Stack>
        <Skeleton h="100%" radius="md" style={{ minHeight: 520, flex: 1 }} />
      </Stack>
    </Box>
  )
}

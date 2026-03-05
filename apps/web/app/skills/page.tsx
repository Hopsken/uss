import { Alert, Box } from '@mantine/core'
import { SkillsClient } from '@/components/skills'
import { fetchSkillsServer } from '@/lib/api-server'

export default async function SkillsPage() {
  try {
    const initialData = await fetchSkillsServer()
    return <SkillsClient initialData={initialData} />
  } catch (error) {
    return (
      <Box p="xl" maw={700} mx="auto">
        <Alert color="red" title="Unable to load skills">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }
}

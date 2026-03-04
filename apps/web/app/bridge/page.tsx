import { Alert, Container, Text, Title } from '@mantine/core'
import { AlertCircle } from 'lucide-react'
import { BridgeDashboard } from '@/components/bridge/BridgeDashboard'
import { fetchBridgeDataServer } from '@/lib/api-server'

export default async function BridgePage() {
  try {
    const data = await fetchBridgeDataServer()
    return <BridgeDashboard data={data} />
  } catch (error) {
    return (
      <Container py="xl">
        <Title order={1} ff="Space Grotesk, system-ui, sans-serif" mb="sm">
          Bridge
        </Title>
        <Alert color="red" icon={<AlertCircle size={16} />} title="Unable to load bridge data">
          <Text size="sm">{error instanceof Error ? error.message : 'Unknown error'}</Text>
        </Alert>
      </Container>
    )
  }
}

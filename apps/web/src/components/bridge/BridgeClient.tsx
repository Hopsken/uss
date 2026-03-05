'use client'

import { Alert, Box, Button, Center, Loader, Stack, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { fetchBridgeData } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { BridgeDashboard } from './BridgeDashboard'

export function BridgeClient() {
  const bridgeQuery = useQuery({
    queryKey: queryKeys.bridge.dashboard,
    queryFn: fetchBridgeData,
  })

  return (
    <>
      {bridgeQuery.isPending && !bridgeQuery.data ? (
        <Center py="xl">
          <Loader color="sky" />
        </Center>
      ) : null}

      {bridgeQuery.error && !bridgeQuery.data ? (
        <Box p={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
          <Alert color="red" icon={<AlertCircle size={16} />} title="Unable to load bridge data">
            <Stack gap="xs">
              <Text size="sm">{bridgeQuery.error instanceof Error ? bridgeQuery.error.message : 'Unknown error'}</Text>
              <Button variant="light" size="xs" onClick={() => bridgeQuery.refetch()} loading={bridgeQuery.isFetching}>
                Retry
              </Button>
            </Stack>
          </Alert>
        </Box>
      ) : null}

      {bridgeQuery.data ? <BridgeDashboard data={bridgeQuery.data} /> : null}
    </>
  )
}

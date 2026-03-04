'use client'

import { Alert, Box, Button, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function SettingsPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onAddPasskey = async () => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const result = await authClient.passkey.addPasskey({
        name: 'USS passkey',
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to add passkey')
      }

      setSuccess('Passkey added. You can now use passkey login from the sign-in page.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add passkey')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box p={{ base: 'md', md: 'xl' }} maw={900} mx="auto">
      <Stack gap="md">
        <Box>
          <Title order={1} ff="var(--font-heading)">
            Settings
          </Title>
          <Text c="dimmed">Account security and sign-in methods</Text>
        </Box>

        {error ? (
          <Alert color="red" title="Passkey setup failed">
            {error}
          </Alert>
        ) : null}

        {success ? (
          <Alert color="green" title="Passkey ready">
            {success}
          </Alert>
        ) : null}

        <Box
          p="lg"
          style={{
            border: '1px solid var(--mantine-color-slate-2)',
            borderRadius: 12,
            background: 'var(--mantine-color-white)',
          }}
        >
          <Stack gap="sm">
            <Title order={3} ff="var(--font-heading)">
              Passkey
            </Title>
            <Text size="sm" c="dimmed">
              Add a passkey after password sign-in. Later you can sign in with passkey directly.
            </Text>
            <Button w="fit-content" onClick={onAddPasskey} loading={isLoading}>
              Add passkey
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

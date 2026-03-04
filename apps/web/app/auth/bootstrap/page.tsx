'use client'

import { Alert, Box, Button, Container, Stack, Text, TextInput, Title } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchBootstrapStatus, startBootstrap } from '@/lib/api'

export default function BootstrapPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const status = await fetchBootstrapStatus()
        if (!status.needsBootstrap) {
          router.replace('/auth/login')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bootstrap status')
      }
    }

    void run()
  }, [router])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      await startBootstrap({ email, name, password })

      router.replace('/bridge')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bootstrap failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container size="xs" py="xl">
      <Box p="xl" style={{ border: '1px solid var(--mantine-color-slate-2)', borderRadius: 12, background: 'white' }}>
        <Stack gap="md">
          <Title order={1} ff="var(--font-heading)">
            Bootstrap USS
          </Title>
          <Text c="dimmed" size="sm">
            Create the single admin account with password sign-in.
          </Text>

          {error ? (
            <Alert color="red" title="Bootstrap failed">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={onSubmit}>
            <Stack gap="sm">
              <TextInput
                label="Admin email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                type="email"
                required
              />
              <TextInput
                label="Display name"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                required
              />
              <TextInput
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                type="password"
                required
              />
              <TextInput
                label="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                type="password"
                required
              />
              <Button type="submit" loading={isLoading}>
                Create admin account
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Container>
  )
}

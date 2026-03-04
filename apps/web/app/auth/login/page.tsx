'use client'

import { Alert, Box, Button, Container, Divider, Stack, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

const DEFAULT_POST_LOGIN_PATH = '/bridge'

function resolveAuthRedirect(resultData: unknown): string {
  if (typeof resultData !== 'object' || resultData === null) {
    return DEFAULT_POST_LOGIN_PATH
  }

  const redirectUrl = 'url' in resultData ? (resultData as { url?: unknown }).url : null
  return typeof redirectUrl === 'string' && redirectUrl.length > 0 ? redirectUrl : DEFAULT_POST_LOGIN_PATH
}

async function ensureSessionReady() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const session = await authClient.getSession({
      query: { disableCookieCache: true },
      fetchOptions: { cache: 'no-store' },
    })

    if (session.data?.session) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 120))
  }
}

function hardRedirect(url: string) {
  window.location.assign(url)
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)

  const onPasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsPasswordLoading(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Email/password login failed')
      }

      await ensureSessionReady()
      hardRedirect(resolveAuthRedirect(result.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const onPasskeyLogin = async () => {
    setError(null)
    setIsPasskeyLoading(true)

    try {
      const result = await authClient.signIn.passkey({ autoFill: true })
      if (result.error) {
        throw new Error(result.error.message || 'Passkey login failed')
      }

      await ensureSessionReady()
      hardRedirect(resolveAuthRedirect(result.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <Container size="xs" py="xl">
      <Box p="xl" style={{ border: '1px solid var(--mantine-color-slate-2)', borderRadius: 12, background: 'white' }}>
        <Stack gap="md">
          <Title order={1} ff="var(--font-heading)">
            Sign in
          </Title>
          <Text c="dimmed" size="sm">
            Sign in with email and password. Use passkey if already enrolled.
          </Text>

          {error ? (
            <Alert color="red" title="Authentication failed">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={onPasswordLogin}>
            <Stack gap="sm">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
              />
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
              />
              <Button type="submit" loading={isPasswordLoading}>
                Sign in
              </Button>
            </Stack>
          </form>

          <Divider label="or" labelPosition="center" />

          <Button variant="light" onClick={onPasskeyLogin} loading={isPasskeyLoading}>
            Sign in with passkey
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}

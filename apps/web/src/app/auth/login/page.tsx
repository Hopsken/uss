'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AuthShell } from '@/components/app/form-shell'
import { authClient } from '@/lib/auth-client'

const DEFAULT_POST_LOGIN_PATH = '/bridge'

function resolveAuthRedirect(resultData: unknown): string {
  if (typeof resultData !== 'object' || resultData === null) return DEFAULT_POST_LOGIN_PATH
  const redirectUrl = 'url' in resultData ? (resultData as { url?: unknown }).url : null
  return typeof redirectUrl === 'string' && redirectUrl.length > 0 ? redirectUrl : DEFAULT_POST_LOGIN_PATH
}

async function ensureSessionReady() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const session = await authClient.getSession({
      query: { disableCookieCache: true },
      fetchOptions: { cache: 'no-store' },
    })

    if (session.data?.session) return
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

      if (result.error) throw new Error(result.error.message || 'Email/password login failed')
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
      if (result.error) throw new Error(result.error.message || 'Passkey login failed')
      await ensureSessionReady()
      hardRedirect(resolveAuthRedirect(result.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <AuthShell title="Sign in" description="Sign in with email and password. Use passkey if already enrolled.">
      <div className="flex flex-col gap-5">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Authentication failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={onPasswordLogin} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required />
          </div>
          <Button type="submit" disabled={isPasswordLoading}>
            Sign in
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.26em] text-muted-foreground">
          <Separator className="flex-1" />
          or
          <Separator className="flex-1" />
        </div>

        <Button variant="secondary" onClick={onPasskeyLogin} disabled={isPasskeyLoading}>
          Sign in with passkey
        </Button>
      </div>
    </AuthShell>
  )
}

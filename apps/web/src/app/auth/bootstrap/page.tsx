'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/app/form-shell'
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
        if (!status.needsBootstrap) router.replace('/auth/login')
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
    <AuthShell title="Bootstrap USS" description="Create the single admin account with password sign-in.">
      <div className="flex flex-col gap-5">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Bootstrap failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input id="admin-email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input id="display-name" value={name} onChange={(event) => setName(event.currentTarget.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} type="password" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.currentTarget.value)} type="password" required />
          </div>
          <Button type="submit" disabled={isLoading}>
            Create admin account
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}

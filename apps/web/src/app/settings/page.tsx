'use client'

import { useState } from 'react'
import { ErrorState, PageContainer, PageHeader, SectionCard } from '@/components/app/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
      const result = await authClient.passkey.addPasskey({ name: 'USS passkey' })
      if (result.error) throw new Error(result.error.message || 'Failed to add passkey')
      setSuccess('Passkey added. You can now use passkey login from the sign-in page.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add passkey')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer size="narrow">
      <PageHeader eyebrow="System" title="Settings" description="Account security and sign-in methods." />

      {error ? <ErrorState title="Passkey setup failed" message={error} /> : null}
      {success ? (
        <Alert>
          <AlertTitle>Passkey ready</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <SectionCard title="Passkey" description="Add a passkey after password sign-in. Later you can sign in with passkey directly.">
        <Button className="w-fit" onClick={onAddPasskey} disabled={isLoading}>
          Add passkey
        </Button>
      </SectionCard>
    </PageContainer>
  )
}

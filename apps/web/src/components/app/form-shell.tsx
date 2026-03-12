'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_35%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.4))] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.28)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.28)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      <Card className="relative z-10 w-full max-w-md border-border/70 bg-card/95 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="font-heading text-3xl">{title}</CardTitle>
          <CardDescription className="text-sm leading-6">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}

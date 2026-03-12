'use client'

import type { ReactNode } from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PageContainer({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'xwide' | 'narrow'
}) {
  const widthClass = {
    narrow: 'max-w-4xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    xwide: 'max-w-[96rem]',
  }[size]

  return <div className={cn('mx-auto flex w-full flex-1 flex-col gap-6 px-4 pb-8 pt-6 md:px-8 md:pt-8', widthClass, className)}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 px-1">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <div className="mb-3 inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="font-heading text-[2.2rem] font-semibold tracking-tight text-foreground md:text-[3rem]">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <Card className={cn('border-border/70 shadow-sm', className)}>
      {title || description || action ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <CardTitle className="font-heading text-base">{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-2">
        <CardDescription className="text-[11px] uppercase tracking-[0.28em]">{label}</CardDescription>
        <CardTitle className="font-mono text-3xl font-semibold tracking-tight">{value}</CardTitle>
        {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
      </CardHeader>
    </Card>
  )
}

export function LoadingState({ label = 'Loading view' }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/25">
      <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
        <LoaderCircle className="size-4 animate-spin text-primary" />
        {label}
      </div>
    </div>
  )
}

export function ErrorState({
  title,
  message,
  retryLabel = 'Retry',
  onRetry,
}: {
  title: string
  message: string
  retryLabel?: string
  onRetry?: () => void
}) {
  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <span>{message}</span>
        {onRetry ? (
          <div>
            <Button variant="outline" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
      <div className="font-heading text-lg font-semibold text-foreground">{title}</div>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

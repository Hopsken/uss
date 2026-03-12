'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function TasksPageHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  actions,
}: {
  eyebrow: string
  icon: LucideIcon
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[32px] border border-border/70 bg-card px-6 py-6 shadow-sm md:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem]">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-[15px]">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

export function TasksStatsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
}

export function TasksStatCard({
  icon: Icon,
  label,
  value,
  tone = 'slate',
}: {
  icon: LucideIcon
  label: string
  value: number
  tone?: 'slate' | 'sky' | 'amber' | 'emerald'
}) {
  const toneClass = {
    slate: 'bg-slate-100 text-slate-600',
    sky: 'bg-sky-100 text-sky-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }[tone]

  return (
    <div className="rounded-[24px] border border-border/70 bg-card px-4 py-4 shadow-sm">
      <div className={`mb-4 inline-flex rounded-full p-2.5 ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[1.75rem] font-semibold leading-none tracking-tight text-foreground">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

export function TasksToolbar({
  primary,
  secondary,
}: {
  primary: ReactNode
  secondary?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 md:px-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">{primary}</div>
        {secondary ? <div className="flex flex-wrap items-center gap-2">{secondary}</div> : null}
      </div>
    </div>
  )
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="flex w-full items-center gap-3 rounded-full border border-border/70 bg-background px-4 py-2.5 shadow-sm xl:max-w-sm">
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}

export function FilterChip({
  label,
  active = false,
  onClick,
  onRemove,
}: {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
}) {
  return (
    <button
      onClick={onClick ?? onRemove}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      <span>{label}</span>
      {onRemove ? <X className={`h-3.5 w-3.5 ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`} /> : null}
    </button>
  )
}

export function EmptySurfaceState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/25 px-6 py-12 text-center">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</div>
    </div>
  )
}

export function UtilityPanel({
  open,
  title,
  description,
  size = 'default',
  onClose,
  children,
}: {
  open: boolean
  title: string
  description: string
  size?: 'default' | 'wide'
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className={size === 'wide' ? 'max-w-5xl p-0' : 'max-w-2xl p-0'}>
        <DialogHeader className="border-b border-border/70 px-5 py-5 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[88dvh] min-h-[min(560px,72dvh)] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export function TaskOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-8">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-[92dvh] w-full overflow-hidden rounded-t-3xl border border-border/70 bg-card shadow-2xl md:h-full md:max-h-[88vh] md:max-w-5xl md:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 hidden rounded-full bg-background/90 p-2 text-muted-foreground shadow-sm transition hover:text-foreground md:flex"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

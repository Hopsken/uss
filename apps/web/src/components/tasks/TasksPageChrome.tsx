'use client'

import type { ReactNode } from 'react'
import { Modal } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import { Search, X } from 'lucide-react'

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
    <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] md:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-[2rem]" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-[15px]">{description}</p>
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
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.4)]">
      <div className={`mb-4 inline-flex rounded-full p-2.5 ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[1.75rem] font-semibold leading-none tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
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
    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:px-5">
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
    <label className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.45)] xl:max-w-sm">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
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
          ? 'border-slate-900 bg-slate-900 text-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.6)]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      <span>{label}</span>
      {onRemove ? <X className={`h-3.5 w-3.5 ${active ? 'text-white/80' : 'text-slate-400'}`} /> : null}
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
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</div>
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
  if (!open) return null

  return (
    <Modal
      opened={open}
      onClose={onClose}
      withCloseButton={false}
      centered
      size={size === 'wide' ? 960 : 560}
      overlayProps={{ backgroundOpacity: 0.35, blur: 6 }}
      padding={0}
      radius={28}
      styles={{
        content: {
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid #e2e8f0',
          minHeight: 'min(720px, calc(100dvh - 40px))',
          boxShadow: '0 24px 60px -24px rgba(15, 23, 42, 0.35)',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex min-h-[min(560px,72dvh)] max-h-[88dvh] flex-col md:min-h-[min(720px,calc(100dvh-40px))]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <div className="text-lg font-semibold text-slate-950">{title}</div>
            <div className="mt-1 text-sm leading-6 text-slate-500">{description}</div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </Modal>
  )
}

export function TaskOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-8">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-[92dvh] w-full overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl md:h-full md:max-h-[88vh] md:max-w-5xl md:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 hidden rounded-full bg-white/90 p-2 text-slate-500 shadow-sm transition hover:text-slate-900 md:flex"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Globe,
  CalendarDays,
  MessageCircle,
  Code2,
  FileText,
  LayoutGrid,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  X,
  Save,
  Eye,
  EyeOff,
  ScrollText,
  Search,
} from 'lucide-react'
import type {
  SkillsProps,
  Skill,
  SkillCategory,
  SkillConfig,
  AgentSkillGroup,
} from './types'

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<SkillCategory, { label: string; icon: ReactNode; bg: string; text: string }> = {
  web: { label: 'Web', icon: <Globe className="w-2.5 h-2.5" />, bg: 'bg-sky-500/10 dark:bg-sky-500/15', text: 'text-sky-600 dark:text-sky-400' },
  calendar: { label: 'Calendar', icon: <CalendarDays className="w-2.5 h-2.5" />, bg: 'bg-violet-500/10 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400' },
  communication: { label: 'Comms', icon: <MessageCircle className="w-2.5 h-2.5" />, bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
  code: { label: 'Code', icon: <Code2 className="w-2.5 h-2.5" />, bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
  notes: { label: 'Notes', icon: <FileText className="w-2.5 h-2.5" />, bg: 'bg-teal-500/10 dark:bg-teal-500/15', text: 'text-teal-600 dark:text-teal-400' },
  productivity: { label: 'Productivity', icon: <LayoutGrid className="w-2.5 h-2.5" />, bg: 'bg-orange-500/10 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400' },
  system: { label: 'System', icon: <Terminal className="w-2.5 h-2.5" />, bg: 'bg-slate-500/10 dark:bg-slate-500/15', text: 'text-slate-500 dark:text-slate-400' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 1) return `${days}d ago`
  if (days === 1) return 'Yesterday'
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

function matchesQuery(skill: Skill, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    skill.name.toLowerCase().includes(lower) ||
    skill.description.toLowerCase().includes(lower) ||
    skill.category.toLowerCase().includes(lower)
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  enabled: boolean
  onChange: (v: boolean) => void
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={(e) => { e.stopPropagation(); onChange(!enabled) }}
      className={`relative shrink-0 w-8 h-4.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
        enabled ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ── Skill row ─────────────────────────────────────────────────────────────────

interface SkillRowProps {
  skill: Skill
  isSelected: boolean
  onSelect: () => void
  onToggle: (enabled: boolean) => void
}

function SkillRow({ skill, isSelected, onSelect, onToggle }: SkillRowProps) {
  const cat = CATEGORY_CONFIG[skill.category]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`w-full flex items-center gap-3 py-3.5 text-left transition-colors ${
        isSelected
          ? 'bg-sky-50 dark:bg-sky-950/30 border-l-2 border-l-sky-400 pl-[14px] pr-4'
          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-4'
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500`}
    >
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${cat.bg} ${cat.text}`}>
        {cat.icon}
        <span className="hidden sm:inline">{cat.label}</span>
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {skill.name}
          </span>
          {skill.configStatus === 'needs_setup' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden md:inline">Needs setup</span>
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
          {skill.description}
        </p>
      </div>

      <span
        className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 hidden md:block tabular-nums w-16 text-right"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {relativeTime(skill.lastUsedAt)}
      </span>

      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <Toggle enabled={skill.isEnabled} onChange={onToggle} />
      </div>
    </div>
  )
}

// ── Agent group ───────────────────────────────────────────────────────────────

interface AgentGroupProps {
  agentId: string | null
  agentName: string
  skills: Skill[]
  selectedSkillId: string | null
  onSelectSkill: (skillId: string) => void
  onToggleSkill: (skillId: string, enabled: boolean) => void
}

function AgentGroup({ agentId, agentName, skills, selectedSkillId, onSelectSkill, onToggleSkill }: AgentGroupProps) {
  const [collapsed, setCollapsed] = useState(false)
  const enabledCount = skills.filter((s) => s.isEnabled).length
  const needsSetupCount = skills.filter((s) => s.configStatus === 'needs_setup').length

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors border-b border-slate-200 dark:border-slate-700/60"
      >
        {agentId ? (
          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 ring-1 ring-slate-200/60 dark:ring-slate-600/40 shrink-0">
            <Image
              src={`https://robohash.org/${agentId}?set=set1&size=48x48`}
              alt={agentName}
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <Terminal className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </div>
        )}

        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 text-left" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          {agentName}
        </span>

        {needsSetupCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-500 shrink-0">
            <AlertTriangle className="w-2.5 h-2.5" />
            {needsSetupCount}
          </span>
        )}

        <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          {enabledCount}/{skills.length}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {skills.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              isSelected={selectedSkillId === skill.id}
              onSelect={() => onSelectSkill(skill.id)}
              onToggle={(enabled) => onToggleSkill(skill.id, enabled)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── SKILL.md helpers ──────────────────────────────────────────────────────────

function parseFrontmatter(raw: string): { frontmatterRaw: string | null; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatterRaw: null, body: raw }
  const frontmatterRaw = match[1] ?? ''
  const body = match[2] ?? ''
  return { frontmatterRaw: frontmatterRaw.trim(), body: body.trim() }
}

function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split('\n')
  const nodes: ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  function flushList() {
    if (listItems.length === 0) return
    nodes.push(
      <ul key={key++} className="space-y-1 my-2 ml-3">
        {listItems.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0">—</span>
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 font-mono">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushList()
      nodes.push(
        <p key={key++} className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-4 mb-1.5" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          {line.slice(3)}
        </p>
      )
    } else if (line.startsWith('# ')) {
      flushList()
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      nodes.push(
        <p key={key++} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      )
    }
  }
  flushList()
  return nodes
}

// ── Side panel ────────────────────────────────────────────────────────────────

interface SidePanelProps {
  skill: Skill
  agentId: string | null
  allAgentGroups: AgentSkillGroup[]
  onClose: () => void
  onSave: (config: SkillConfig[]) => void
  onAssign: (targetAgentId: string) => void
}

function SidePanel({ skill, agentId, allAgentGroups, onClose, onSave, onAssign }: SidePanelProps) {
  const [editedConfig, setEditedConfig] = useState<SkillConfig[]>(skill.config)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'details' | 'skill-md'>('details')
  const cat = CATEGORY_CONFIG[skill.category]
  const isDirty = JSON.stringify(editedConfig) !== JSON.stringify(skill.config)
  const hasInstructions = Boolean(skill.instructions?.trim())

  useEffect(() => {
    setEditedConfig(skill.config)
    setRevealed({})
    setActiveTab('details')
  }, [skill.id, skill.config])

  useEffect(() => {
    if (!hasInstructions && activeTab === 'skill-md') {
      setActiveTab('details')
    }
  }, [activeTab, hasInstructions])

  const { frontmatterRaw, body } = skill.instructions
    ? parseFrontmatter(skill.instructions)
    : { frontmatterRaw: null, body: '' }
  const tabs: Array<{ id: 'details' | 'skill-md'; label: string; icon: ReactNode }> = [
    { id: 'details', label: 'Config', icon: <Save className="w-3 h-3" /> },
    ...(hasInstructions ? [{ id: 'skill-md' as const, label: 'SKILL.md', icon: <ScrollText className="w-3 h-3" /> }] : []),
  ]

  function updateField(key: string, value: string) {
    setEditedConfig((prev) => prev.map((f) => f.key === key ? { ...f, value } : f))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${cat.bg} ${cat.text}`}>
              {cat.icon}
              {cat.label}
            </span>
            {skill.configStatus === 'configured' ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                Needs setup
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            {skill.name}
          </h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-1 py-2.5 mr-5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {activeTab === 'skill-md' && skill.instructions ? (
          <div>
            {frontmatterRaw && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 mb-4">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Frontmatter</p>
                <pre className="text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{frontmatterRaw}</pre>
              </div>
            )}
            <div>{renderMarkdown(body)}</div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{skill.description}</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-slate-500">Last used</span>
              <span className="text-slate-600 dark:text-slate-300 tabular-nums" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {relativeTime(skill.lastUsedAt)}
              </span>
            </div>

            {editedConfig.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Configuration</p>
                <div className="space-y-3">
                  {editedConfig.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">{field.label}</label>
                      <div className="relative">
                        <input
                          type={field.isSecret && !revealed[field.key] ? 'password' : 'text'}
                          value={field.value}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          placeholder={field.isSecret ? 'Enter value…' : ''}
                          className="w-full text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-400 dark:focus:border-sky-600 transition-colors pr-8"
                          style={{ fontFamily: field.isSecret ? '"JetBrains Mono", monospace' : 'inherit' }}
                        />
                        {field.isSecret && (
                          <button
                            type="button"
                            onClick={() => setRevealed((r) => ({ ...r, [field.key]: !r[field.key] }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {revealed[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Assigned to</p>
              <div className="flex flex-wrap gap-1.5">
                {allAgentGroups.map((group) => (
                  <button
                    key={group.agentId}
                    onClick={() => onAssign(group.agentId)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border transition-colors ${
                      group.agentId === agentId
                        ? 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-sky-950/30 dark:border-sky-700 dark:text-sky-400'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                      <Image
                        src={`https://robohash.org/${group.agentId}?set=set1&size=32x32`}
                        alt={group.agentName}
                        width={16}
                        height={16}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{group.agentName}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {activeTab === 'details' && editedConfig.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onSave(editedConfig)}
            disabled={!isDirty}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              isDirty
                ? 'bg-sky-600 hover:bg-sky-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            <Save className="w-3.5 h-3.5" />
            Save changes
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Skills({
  systemSkills,
  agentGroups,
  selectedSkillId,
  selectedAgentId,
  onToggleSkill,
  onSelectSkill,
  onClosePanel,
  onSaveConfig,
  onAssignSkill,
}: SkillsProps) {
  const [search, setSearch] = useState('')
  const q = search.trim()

  const filteredSystemSkills = useMemo(
    () => systemSkills.filter((s) => matchesQuery(s, q)),
    [systemSkills, q],
  )

  const filteredAgentGroups = useMemo(
    () =>
      agentGroups
        .map((g) => ({ ...g, skills: g.skills.filter((s) => matchesQuery(s, q)) }))
        .filter((g) => !q || g.skills.length > 0),
    [agentGroups, q],
  )

  const totalNeedsSetup = useMemo(
    () =>
      [...systemSkills, ...agentGroups.flatMap((g) => g.skills)].filter(
        (s) => s.configStatus === 'needs_setup',
      ).length,
    [systemSkills, agentGroups],
  )

  const noResults = q && filteredSystemSkills.length === 0 && filteredAgentGroups.length === 0

  const selectedSkill = (() => {
    if (!selectedSkillId) return null
    if (selectedAgentId === null) return systemSkills.find((s) => s.id === selectedSkillId) ?? null
    return agentGroups.find((g) => g.agentId === selectedAgentId)?.skills.find((s) => s.id === selectedSkillId) ?? null
  })()

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0">

      {/* ── Left: skill list ─────────────────────────────────────────────────── */}
      <div className="flex-1 md:flex-none md:w-96 lg:w-[420px] shrink-0 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">

        <div className="px-4 sm:px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Skills</h1>
            {totalNeedsSetup > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                <AlertTriangle className="w-3 h-3" />
                {totalNeedsSetup} need{totalNeedsSetup === 1 ? 's' : ''} setup
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills…"
              className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-5 py-4 space-y-4">
            {filteredSystemSkills.length > 0 && (
              <AgentGroup
                agentId={null}
                agentName="System"
                skills={filteredSystemSkills}
                selectedSkillId={selectedSkillId ?? null}
                onSelectSkill={(id) => onSelectSkill?.(id, null)}
                onToggleSkill={(id, enabled) => onToggleSkill?.(id, null, enabled)}
              />
            )}

            {filteredAgentGroups.map((group) => (
              <AgentGroup
                key={group.agentId}
                agentId={group.agentId}
                agentName={group.agentName}
                skills={group.skills}
                selectedSkillId={selectedSkillId ?? null}
                onSelectSkill={(id) => onSelectSkill?.(id, group.agentId)}
                onToggleSkill={(id, enabled) => onToggleSkill?.(id, group.agentId, enabled)}
              />
            ))}

            {noResults && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No skills match</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">"{search}"</p>
                <button onClick={() => setSearch('')} className="mt-3 text-xs text-sky-600 dark:text-sky-400 hover:underline">Clear search</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop: right panel ─────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 min-w-0 overflow-y-auto flex-col bg-slate-50/50 dark:bg-slate-950/30">
        {selectedSkill ? (
          <SidePanel
            key={`${selectedAgentId ?? 'system'}:${selectedSkill.id}`}
            skill={selectedSkill}
            agentId={selectedAgentId ?? null}
            allAgentGroups={agentGroups}
            onClose={() => onClosePanel?.()}
            onSave={(config) => onSaveConfig?.(selectedSkill.id, selectedAgentId ?? null, config)}
            onAssign={(targetAgentId) => onAssignSkill?.(selectedSkill.id, targetAgentId)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-24 text-center px-8">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Terminal className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Select a skill</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click any skill to view details and configuration</p>
          </div>
        )}
      </div>

      {/* ── Mobile: bottom sheet panel ───────────────────────────────────────── */}
      {selectedSkill && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClosePanel?.()} />
          <div className="relative w-full h-[88dvh] bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <SidePanel
              key={`${selectedAgentId ?? 'system'}:${selectedSkill.id}`}
              skill={selectedSkill}
              agentId={selectedAgentId ?? null}
              allAgentGroups={agentGroups}
              onClose={() => onClosePanel?.()}
              onSave={(config) => onSaveConfig?.(selectedSkill.id, selectedAgentId ?? null, config)}
              onAssign={(targetAgentId) => onAssignSkill?.(selectedSkill.id, targetAgentId)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

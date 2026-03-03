export type SkillCategory = 'web' | 'calendar' | 'communication' | 'code' | 'notes' | 'productivity' | 'system'

export type ConfigStatus = 'configured' | 'needs_setup'

export interface SkillConfig {
  key: string
  label: string
  value: string
  /** Whether to mask the value in the UI */
  isSecret: boolean
}

export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  isEnabled: boolean
  configStatus: ConfigStatus
  /** ISO 8601 string, or null if never used */
  lastUsedAt: string | null
  config: SkillConfig[]
  /** Full SKILL.md content in Markdown */
  instructions?: string
}

export interface AgentSkillGroup {
  agentId: string
  agentName: string
  skills: Skill[]
}

export interface SkillsProps {
  /** Global skills not tied to any agent */
  systemSkills: Skill[]
  /** Per-agent skill groups */
  agentGroups: AgentSkillGroup[]
  /** Currently selected skill (for the side panel) */
  selectedSkillId?: string | null
  /** agentId of the group containing the selected skill (null = system) */
  selectedAgentId?: string | null
  /** Called when the user toggles a skill on or off */
  onToggleSkill?: (skillId: string, agentId: string | null, enabled: boolean) => void
  /** Called when the user clicks a skill to open the config panel */
  onSelectSkill?: (skillId: string, agentId: string | null) => void
  /** Called when the user closes the side panel */
  onClosePanel?: () => void
  /** Called when the user saves config changes for a skill */
  onSaveConfig?: (skillId: string, agentId: string | null, config: SkillConfig[]) => void
  /** Called when the user assigns a skill to a different agent */
  onAssignSkill?: (skillId: string, targetAgentId: string) => void
}

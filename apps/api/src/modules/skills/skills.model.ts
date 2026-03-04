import { t } from "elysia";

const skillCategorySchema = t.Union([
  t.Literal("web"),
  t.Literal("calendar"),
  t.Literal("communication"),
  t.Literal("code"),
  t.Literal("notes"),
  t.Literal("productivity"),
  t.Literal("system"),
]);

const configStatusSchema = t.Union([
  t.Literal("configured"),
  t.Literal("needs_setup"),
]);

export const skillConfigSchema = t.Object({
  key: t.String({ minLength: 1 }),
  label: t.String(),
  value: t.String(),
  isSecret: t.Boolean(),
});

const skillSchema = t.Object({
  id: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  description: t.String(),
  category: skillCategorySchema,
  isEnabled: t.Boolean(),
  configStatus: configStatusSchema,
  lastUsedAt: t.Union([t.String({ format: "date-time" }), t.Null()]),
  config: t.Array(skillConfigSchema),
  instructions: t.Optional(t.String()),
});

const agentSkillGroupSchema = t.Object({
  agentId: t.String({ minLength: 1 }),
  agentName: t.String({ minLength: 1 }),
  skills: t.Array(skillSchema),
});

export const skillsResponseSchema = t.Object({
  systemSkills: t.Array(skillSchema),
  agentGroups: t.Array(agentSkillGroupSchema),
  syncedAt: t.String({ format: "date-time" }),
});

export const toggleSkillBodySchema = t.Object({
  agentId: t.Union([t.String({ minLength: 1 }), t.Null()]),
  enabled: t.Boolean(),
});

export const toggleSkillResponseSchema = t.Object({
  ok: t.Literal(true),
  skillId: t.String({ minLength: 1 }),
  agentId: t.Union([t.String({ minLength: 1 }), t.Null()]),
  enabled: t.Boolean(),
  syncedAt: t.String({ format: "date-time" }),
});

export const saveSkillConfigBodySchema = t.Object({
  agentId: t.Union([t.String({ minLength: 1 }), t.Null()]),
  config: t.Array(skillConfigSchema),
});

export const saveSkillConfigResponseSchema = t.Object({
  ok: t.Literal(true),
  skillId: t.String({ minLength: 1 }),
  agentId: t.Union([t.String({ minLength: 1 }), t.Null()]),
  config: t.Array(skillConfigSchema),
  syncedAt: t.String({ format: "date-time" }),
});

export const assignSkillBodySchema = t.Object({
  sourceAgentId: t.Union([t.String({ minLength: 1 }), t.Null()]),
  targetAgentId: t.String({ minLength: 1 }),
});

export const assignSkillResponseSchema = t.Object({
  ok: t.Literal(true),
  skillId: t.String({ minLength: 1 }),
  sourceAgentId: t.Union([t.String({ minLength: 1 }), t.Null()]),
  targetAgentId: t.String({ minLength: 1 }),
  applied: t.Boolean(),
  reason: t.Union([t.String(), t.Null()]),
  syncedAt: t.String({ format: "date-time" }),
});

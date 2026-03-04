import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type {
  AgentSkillGroup,
  Skill,
  SkillCategory,
  SkillConfig,
} from "@uss/shared";

const REDACTED_SENTINEL = "__OPENCLAW_REDACTED__";
const SKILL_MD_MAX_BYTES = 256_000;

type JsonObject = Record<string, unknown>;

type StatusSkillRow = {
  raw: JsonObject;
  skillId: string;
  name: string;
};

export type ParsedConfigState = {
  config: JsonObject;
  baseHash: string | null;
};

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonObject;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeAgentId(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function isSecretKey(key: string): boolean {
  return /token|secret|api[_-]?key|password|credential|passwd|pwd/i.test(key);
}

function inferCategory(input: { name: string; description: string; source: string | null }): SkillCategory {
  const text = `${input.name} ${input.description}`.toLowerCase();

  if (/calendar|schedule/.test(text)) return "calendar";
  if (/gmail|mail|email|slack|discord|telegram|message|comms|chat/.test(text)) return "communication";
  if (/browser|search|crawl|scrape|web|http/.test(text)) return "web";
  if (/git|code|patch|diff|repo|terminal|shell|exec|bash|command/.test(text)) return "code";
  if (/note|notion|doc|memory|journal/.test(text)) return "notes";
  if (/system|host|runtime|daemon/.test(text)) return "system";
  if ((input.source ?? "").includes("bundled")) return "system";

  return "productivity";
}

function hasMissingRequirements(raw: JsonObject): boolean {
  if (raw.eligible === false) {
    return true;
  }

  const missing = asObject(raw.missing);
  if (missing) {
    const keys = ["bins", "env", "config", "os"];
    for (const key of keys) {
      if (asArray(missing[key]).length > 0) {
        return true;
      }
    }
  }

  const checks = asArray<JsonObject>(raw.configChecks);
  if (checks.some((check) => check.satisfied === false)) {
    return true;
  }

  return false;
}

function parseStatusSkills(statusRaw: unknown): StatusSkillRow[] {
  const rows = asArray<JsonObject>(asObject(statusRaw)?.skills);

  return rows
    .map((raw) => {
      const skillId = asString(raw.skillKey) ?? asString(raw.name);
      if (!skillId) {
        return null;
      }

      return {
        raw,
        skillId,
        name: asString(raw.name) ?? skillId,
      };
    })
    .filter((row): row is StatusSkillRow => row !== null);
}

function resolveSkillConfigById(config: JsonObject, skillId: string): JsonObject {
  const skills = asObject(config.skills);
  const entries = asObject(skills?.entries);
  const row = asObject(entries?.[skillId]);

  return row ?? {};
}

function normalizeConfigValue(raw: unknown): string {
  if (typeof raw !== "string") {
    return "";
  }

  if (raw === REDACTED_SENTINEL) {
    return "";
  }

  return raw;
}

function buildSkillConfigFields(params: {
  statusSkill: StatusSkillRow;
  config: JsonObject;
}): SkillConfig[] {
  const skillCfg = resolveSkillConfigById(params.config, params.statusSkill.skillId);
  const fields: SkillConfig[] = [];

  const primaryEnv = asString(params.statusSkill.raw.primaryEnv);
  const requiredEnv = new Set<string>();

  if (primaryEnv) {
    requiredEnv.add(primaryEnv);
  }

  const requirements = asObject(params.statusSkill.raw.requirements);
  for (const key of asArray<string>(requirements?.env)) {
    const trimmed = key.trim();
    if (trimmed) {
      requiredEnv.add(trimmed);
    }
  }

  const missing = asObject(params.statusSkill.raw.missing);
  for (const key of asArray<string>(missing?.env)) {
    const trimmed = key.trim();
    if (trimmed) {
      requiredEnv.add(trimmed);
    }
  }

  const apiKey = normalizeConfigValue(skillCfg.apiKey);
  if (apiKey || primaryEnv) {
    fields.push({
      key: "api_key",
      label: primaryEnv ? `${primaryEnv} API Key` : "API Key",
      value: apiKey,
      isSecret: true,
    });
  }

  const envCfg = asObject(skillCfg.env) ?? {};
  const envKeys = new Set<string>([
    ...Object.keys(envCfg),
    ...requiredEnv,
  ]);

  for (const envKey of Array.from(envKeys).sort((a, b) => a.localeCompare(b))) {
    const rawValue = envCfg[envKey];
    fields.push({
      key: `env:${envKey}`,
      label: envKey,
      value: normalizeConfigValue(rawValue),
      isSecret: isSecretKey(envKey),
    });
  }

  return fields;
}

async function loadSkillInstructions(raw: JsonObject): Promise<string | undefined> {
  const filePath = asString(raw.filePath);
  if (!filePath) {
    return undefined;
  }

  if (path.basename(filePath) !== "SKILL.md") {
    return undefined;
  }

  try {
    const st = await stat(filePath);
    if (!st.isFile() || st.size > SKILL_MD_MAX_BYTES) {
      return undefined;
    }

    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

async function mapOneSkill(params: {
  statusSkill: StatusSkillRow;
  config: JsonObject;
}): Promise<Skill> {
  const description = asString(params.statusSkill.raw.description) ?? params.statusSkill.name;
  const source = asString(params.statusSkill.raw.source);

  return {
    id: params.statusSkill.skillId,
    name: params.statusSkill.name,
    description,
    category: inferCategory({
      name: params.statusSkill.name,
      description,
      source,
    }),
    isEnabled: params.statusSkill.raw.disabled !== true,
    configStatus: hasMissingRequirements(params.statusSkill.raw) ? "needs_setup" : "configured",
    lastUsedAt: null,
    config: buildSkillConfigFields({
      statusSkill: params.statusSkill,
      config: params.config,
    }),
    instructions: await loadSkillInstructions(params.statusSkill.raw),
  };
}

export function parseAgentsList(agentsRaw: unknown): Array<{ id: string; name: string }> {
  const rows = asArray<JsonObject>(asObject(agentsRaw)?.agents);

  return rows
    .map((row) => {
      const id = asString(row.id);
      if (!id) {
        return null;
      }

      return {
        id,
        name: asString(asObject(row.identity)?.name) ?? asString(row.name) ?? id,
      };
    })
    .filter((row): row is { id: string; name: string } => row !== null);
}

export async function mapSkillsFromStatus(params: {
  statusRaw: unknown;
  config: JsonObject;
}): Promise<Skill[]> {
  const statusSkills = parseStatusSkills(params.statusRaw);

  const rows = await Promise.all(
    statusSkills.map((statusSkill) =>
      mapOneSkill({
        statusSkill,
        config: params.config,
      }),
    ),
  );

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export function buildAgentGroups(params: {
  agentStatuses: Array<{ agentId: string; agentName: string; skills: Skill[] }>;
}): AgentSkillGroup[] {
  return params.agentStatuses
    .filter((group) => group.skills.length > 0)
    .map((group) => ({
      agentId: group.agentId,
      agentName: group.agentName,
      skills: group.skills,
    }));
}

export function buildSkillsUpdatePayload(config: SkillConfig[]): {
  apiKey?: string;
  env?: Record<string, string>;
} {
  const env: Record<string, string> = {};
  let apiKey: string | undefined;

  for (const field of config) {
    if (field.key === "api_key" || field.key === "apiKey") {
      apiKey = field.value;
      continue;
    }

    if (field.key.startsWith("env:")) {
      const envKey = field.key.slice("env:".length).trim();
      if (!envKey) {
        continue;
      }

      env[envKey] = field.value;
      continue;
    }

    const fallbackKey = field.key.trim();
    if (!fallbackKey) {
      continue;
    }

    env[fallbackKey] = field.value;
  }

  return {
    ...(typeof apiKey === "string" ? { apiKey } : {}),
    ...(Object.keys(env).length > 0 ? { env } : {}),
  };
}

export function parseConfigState(configSnapshotRaw: unknown): ParsedConfigState {
  const snapshot = asObject(configSnapshotRaw);

  return {
    config: asObject(snapshot?.config) ?? {},
    baseHash: asString(snapshot?.hash),
  };
}

function normalizeSkillArray(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  return raw
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

function getAgentEntryById(list: JsonObject[], agentId: string): JsonObject | undefined {
  const normalized = normalizeAgentId(agentId);
  if (!normalized) {
    return undefined;
  }

  return list.find((row) => normalizeAgentId(asString(row.id)) === normalized);
}

export function buildAssignPatch(params: {
  config: JsonObject;
  skillId: string;
  sourceAgentId: string | null;
  targetAgentId: string;
}): { patch: Record<string, unknown> | null; applied: boolean; reason: string | null } {
  const agents = asObject(params.config.agents);
  const list = asArray<JsonObject>(agents?.list);

  if (list.length === 0) {
    return {
      patch: null,
      applied: false,
      reason: "no_agents_configured",
    };
  }

  const sourceEntry = params.sourceAgentId
    ? getAgentEntryById(list, params.sourceAgentId)
    : null;
  const targetEntry = getAgentEntryById(list, params.targetAgentId);

  if (!targetEntry) {
    return {
      patch: null,
      applied: false,
      reason: "target_agent_not_configured",
    };
  }

  const sourceSkills = sourceEntry ? normalizeSkillArray(sourceEntry.skills) : [];
  const targetSkills = normalizeSkillArray(targetEntry.skills);

  if (params.sourceAgentId && sourceSkills === undefined) {
    return {
      patch: null,
      applied: false,
      reason: "source_filter_undefined_noop",
    };
  }

  if (targetSkills === undefined) {
    return {
      patch: null,
      applied: false,
      reason: "target_filter_undefined_noop",
    };
  }

  const sourceBase = sourceSkills ?? [];
  const nextSource = sourceBase.filter((row) => row !== params.skillId);
  const nextTarget = targetSkills.includes(params.skillId)
    ? targetSkills.slice()
    : [...targetSkills, params.skillId];

  const sourceChanged = sourceEntry ? nextSource.length !== sourceBase.length : false;
  const targetChanged = nextTarget.length !== targetSkills.length;

  if (!sourceChanged && !targetChanged) {
    return {
      patch: null,
      applied: false,
      reason: "no_change",
    };
  }

  const patchRows: Array<{ id: string; skills: string[] }> = [];

  if (sourceEntry && sourceChanged) {
    const id = asString(sourceEntry.id);
    if (id) {
      patchRows.push({ id, skills: nextSource });
    }
  }

  if (targetChanged) {
    const id = asString(targetEntry.id);
    if (id) {
      patchRows.push({ id, skills: nextTarget });
    }
  }

  if (patchRows.length === 0) {
    return {
      patch: null,
      applied: false,
      reason: "no_change",
    };
  }

  return {
    patch: {
      agents: {
        list: patchRows,
      },
    },
    applied: true,
    reason: null,
  };
}

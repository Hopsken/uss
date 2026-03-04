import { randomUUID } from "node:crypto";
import type {
  AgentDetailPayload,
  AgentListItem,
  AgentModel,
  AgentSkillSummary,
  AgentStatus,
  AgentTaskHistoryItem,
  AgentTaskStatus,
  AgentsListResponse,
} from "@uss/shared";
import type { AgentFileInfo, AgentIdentity } from "./agents.gateway.repository.js";
import type { AgentsCoreRaw, JsonObject } from "./agents.model.js";

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as JsonObject;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toIso(ms: number | null): string {
  return new Date(ms ?? Date.now()).toISOString();
}

function normalizeTaskStatus(statusRaw: unknown): AgentTaskStatus {
  if (statusRaw === "ok") {
    return "completed";
  }

  if (statusRaw === "error") {
    return "failed";
  }

  if (statusRaw === "running") {
    return "running";
  }

  return "scheduled";
}

function parseRoleFromIdentityDoc(markdown: string | null): string | null {
  if (!markdown) {
    return null;
  }

  const personaMatch = markdown.match(/\*\*\s*Persona:\s*\*\*\s*([^\n]+)/i);
  if (personaMatch?.[1]) {
    return personaMatch[1].trim();
  }

  const plainMatch = markdown.match(/^Persona:\s*([^\n]+)/im);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return null;
}

function parseRoleFromAgentsDoc(markdown: string | null): string | null {
  if (!markdown) {
    return null;
  }

  const heading = markdown.match(/^#\s+([^\n]+)/m)?.[1]?.trim();
  if (!heading) {
    return null;
  }

  const split = heading.split(/[—-]/).map((part) => part.trim()).filter(Boolean);
  const rolePart = split.length > 1 ? split[1] : split[0];
  if (!rolePart) {
    return null;
  }

  return rolePart.replace(/\bagent\b/i, "").trim() || null;
}

function parseSkillsFromToolsDoc(markdown: string | null): AgentSkillSummary[] {
  if (!markdown) {
    return [];
  }

  const lines = markdown.split("\n");
  const skills: AgentSkillSummary[] = [];
  let section: "enabled" | "disabled" | null = null;

  for (const line of lines) {
    const normalized = line.trim();
    if (/^##\s+enabled/i.test(normalized)) {
      section = "enabled";
      continue;
    }

    if (/^##\s+disabled/i.test(normalized)) {
      section = "disabled";
      continue;
    }

    if (!section || !normalized.startsWith("-")) {
      continue;
    }

    const inlineCode = normalized.match(/`([^`]+)`/);
    const rawName = inlineCode?.[1] ?? normalized.replace(/^-\s+/, "").split("—")[0]?.trim();
    if (!rawName) {
      continue;
    }

    const id = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    skills.push({
      id: id || randomUUID(),
      name: rawName,
      enabled: section === "enabled",
    });
  }

  return skills;
}

function normalizeAgentStatus(params: {
  agentId: string;
  runningByAgent: Map<string, string>;
  statusByAgentRaw: Map<string, JsonObject>;
}): AgentStatus {
  if (params.runningByAgent.has(params.agentId)) {
    return "busy";
  }

  const statusEntry = params.statusByAgentRaw.get(params.agentId);
  const recent = asArray<JsonObject>(statusEntry?.recent);
  const newest = recent.at(0);
  if (!newest) {
    return "idle";
  }

  const flags = asArray<string>(newest.flags);
  if (flags.includes("aborted")) {
    return "error";
  }

  const updatedAt = asNumber(newest.updatedAt);
  if (updatedAt && Date.now() - updatedAt <= 5 * 60 * 1000) {
    return "busy";
  }

  return "idle";
}

function buildAvailableModels(modelsRaw: unknown): AgentModel[] {
  const list = asArray<JsonObject>(asObject(modelsRaw)?.models);

  return list
    .map((model) => {
      const id = asString(model.id);
      if (!id) {
        return null;
      }

      return {
        id,
        name: asString(model.name) ?? id,
      };
    })
    .filter((model): model is AgentModel => model !== null);
}

function mapCoreAgents(params: {
  coreRaw: AgentsCoreRaw;
  identitiesByAgent: Map<string, AgentIdentity | null>;
  rolesByAgent: Map<string, string>;
  availableModels: AgentModel[];
}): AgentListItem[] {
  const agentsPayload = asObject(params.coreRaw.agentsList);
  const statusPayload = asObject(params.coreRaw.status);
  const cronListPayload = asObject(params.coreRaw.cronList);

  const jobs = asArray<JsonObject>(cronListPayload?.jobs);
  const runningByAgent = new Map<string, string>();
  for (const job of jobs) {
    const agentId = asString(job.agentId);
    const name = asString(job.name);
    const runningAtMs = asNumber(asObject(job.state)?.runningAtMs);

    if (agentId && name && runningAtMs) {
      runningByAgent.set(agentId, name);
    }
  }

  const statusByAgentRaw = new Map<string, JsonObject>();
  const statusByAgentRows = asArray<JsonObject>(asObject(statusPayload?.sessions)?.byAgent);
  for (const row of statusByAgentRows) {
    const agentId = asString(row.agentId);
    if (agentId) {
      statusByAgentRaw.set(agentId, row);
    }
  }

  const modelsByAgent = new Map<string, string>();
  for (const [agentId, row] of statusByAgentRaw.entries()) {
    const recent = asArray<JsonObject>(row.recent);
    const modelId = asString(recent.at(0)?.model);
    if (modelId) {
      modelsByAgent.set(agentId, modelId);
    }
  }

  const listed = asArray<JsonObject>(agentsPayload?.agents);
  const defaultModelId = params.availableModels[0]?.id ?? "unknown";

  return listed.map((entry) => {
    const id = asString(entry.id) ?? randomUUID();
    const identity = params.identitiesByAgent.get(id);
    const modelId = modelsByAgent.get(id) ?? defaultModelId;

    return {
      id,
      name: identity?.name ?? id,
      role: params.rolesByAgent.get(id) ?? "Agent",
      status: normalizeAgentStatus({
        agentId: id,
        runningByAgent,
        statusByAgentRaw,
      }),
      model: {
        id: modelId,
        name: params.availableModels.find((model) => model.id === modelId)?.name ?? modelId,
      },
    };
  });
}

function mapRecentTasksForAgent(params: {
  coreRaw: AgentsCoreRaw;
  agentId: string;
}): AgentTaskHistoryItem[] {
  const cronRunsPayload = asObject(params.coreRaw.cronRuns);
  const cronListPayload = asObject(params.coreRaw.cronList);
  const runs = asArray<JsonObject>(cronRunsPayload?.entries);
  const jobs = asArray<JsonObject>(cronListPayload?.jobs);
  const jobById = new Map<string, JsonObject>();

  for (const job of jobs) {
    const id = asString(job.id);
    if (id) {
      jobById.set(id, job);
    }
  }

  return runs
    .map((run, idx) => {
      const jobId = asString(run.jobId) ?? `job-${idx}`;
      const job = jobById.get(jobId);
      const agentId = asString(job?.agentId);
      if (agentId !== params.agentId) {
        return null;
      }

      const runAtMs = asNumber(run.runAtMs) ?? asNumber(run.ts);

      return {
        id: `run-${jobId}-${runAtMs ?? idx}`,
        title: asString(run.jobName) ?? asString(job?.name) ?? jobId,
        status: normalizeTaskStatus(run.status),
        ranAt: toIso(runAtMs),
      };
    })
    .filter((item): item is AgentTaskHistoryItem => item !== null)
    .slice(0, 8);
}

function toSkillFallbackFromStatus(skillsStatusRaw: unknown): AgentSkillSummary[] {
  const skills = asArray<JsonObject>(asObject(skillsStatusRaw)?.skills);

  return skills
    .slice(0, 25)
    .map((skill) => {
      const key = asString(skill.skillKey) ?? asString(skill.name);
      if (!key) {
        return null;
      }

      const missing = asObject(skill.missing);
      const missingBins = asArray(missing?.bins).length;
      const missingEnv = asArray(missing?.env).length;
      const blocked = Boolean(skill.blockedByAllowlist);
      const disabled = Boolean(skill.disabled);

      return {
        id: key,
        name: asString(skill.name) ?? key,
        enabled: !blocked && !disabled && missingBins === 0 && missingEnv === 0,
      };
    })
    .filter((skill): skill is AgentSkillSummary => skill !== null);
}

function pickDocContentByName(docs: Map<string, string>, name: string): string | null {
  const exact = docs.get(name);
  if (exact) {
    return exact;
  }

  const lower = name.toLowerCase();
  for (const [docName, content] of docs.entries()) {
    if (docName.toLowerCase() === lower) {
      return content;
    }
  }

  return null;
}

export function mapAgentsListResponse(params: {
  coreRaw: AgentsCoreRaw;
  identitiesByAgent: Map<string, AgentIdentity | null>;
  rolesByAgent: Map<string, string>;
  syncedAt: string;
}): AgentsListResponse {
  const availableModels = buildAvailableModels(params.coreRaw.modelsList);

  return {
    agents: mapCoreAgents({
      coreRaw: params.coreRaw,
      identitiesByAgent: params.identitiesByAgent,
      rolesByAgent: params.rolesByAgent,
      availableModels,
    }),
    availableModels,
    syncedAt: params.syncedAt,
  };
}

export function mapAgentDetailResponse(params: {
  coreRaw: AgentsCoreRaw;
  listItem: AgentListItem;
  docsByName: Map<string, string>;
  files: AgentFileInfo[];
  sessionsRaw: unknown;
  skillsStatusRaw: unknown;
}): AgentDetailPayload {
  const identityContent = pickDocContentByName(params.docsByName, "IDENTITY.md");
  const agentsContent = pickDocContentByName(params.docsByName, "AGENTS.md");
  const toolsContent = pickDocContentByName(params.docsByName, "TOOLS.md");

  const role =
    parseRoleFromIdentityDoc(identityContent) ??
    parseRoleFromAgentsDoc(agentsContent) ??
    params.listItem.role;

  const skillsFromTools = parseSkillsFromToolsDoc(toolsContent);
  const fallbackSkills = toSkillFallbackFromStatus(params.skillsStatusRaw);

  const configDocs = params.files
    .map((file) => ({
      filename: file.name,
      content: params.docsByName.get(file.name) ?? "",
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename));

  const sessionsObj = asObject(params.sessionsRaw);
  const conversations = Math.max(0, asNumber(sessionsObj?.count) ?? 0);

  return {
    id: params.listItem.id,
    name: params.listItem.name,
    role,
    status: params.listItem.status,
    model: params.listItem.model,
    usageSummary: {
      tokens: 0,
      costUsd: 0,
      conversations,
    },
    recentTasks: mapRecentTasksForAgent({
      coreRaw: params.coreRaw,
      agentId: params.listItem.id,
    }),
    skills: skillsFromTools.length > 0 ? skillsFromTools : fallbackSkills,
    configDocs,
  };
}

export function extractRoleFromDocs(params: {
  identityDoc: string | null;
  agentsDoc: string | null;
}): string | null {
  return parseRoleFromIdentityDoc(params.identityDoc) ?? parseRoleFromAgentsDoc(params.agentsDoc);
}

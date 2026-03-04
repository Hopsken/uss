import { randomUUID } from "node:crypto";
import type {
  BridgeAgent,
  BridgeResponse,
  OpenClawStatus,
  Provider,
  ProviderStatus,
  RecentTaskRun,
  SystemHealth,
  TaskRunStatus,
} from "@uss/shared";
import type { BridgeRawPayload, JsonObject } from "./bridge.model.js";

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

function nowIsoFromMs(ms: number | null): string {
  return new Date(ms ?? Date.now()).toISOString();
}

function normalizeProviderStatus(entry: JsonObject): ProviderStatus {
  const error = asString(entry.error);
  const windows = asArray(entry.windows);

  if (error) {
    return "down";
  }

  return windows.length > 0 ? "healthy" : "degraded";
}

function normalizeTaskRunStatus(value: unknown): TaskRunStatus {
  if (value === "ok") {
    return "completed";
  }

  if (value === "error") {
    return "failed";
  }

  if (value === "skipped") {
    return "scheduled";
  }

  if (value === "running") {
    return "running";
  }

  return "scheduled";
}

function inferOpenClawStatus(params: {
  uptimeSeconds: number;
  hadError: boolean;
}): OpenClawStatus {
  if (params.hadError) {
    return "error";
  }

  return params.uptimeSeconds > 0 ? "running" : "stopped";
}

function pickArrayPayload(payload: unknown, keys: string[]): JsonObject[] {
  const direct = asArray<JsonObject>(payload);
  if (direct.length > 0) {
    return direct;
  }

  const obj = asObject(payload);
  if (!obj) {
    return [];
  }

  for (const key of keys) {
    const arr = asArray<JsonObject>(obj[key]);
    if (arr.length > 0) {
      return arr;
    }
  }

  return [];
}

export function mapBridgePayload(raw: BridgeRawPayload): BridgeResponse {
  const agentsPayload = asObject(raw.agentsList);
  const statusPayload = asObject(raw.status);
  const usageTodayPayload = asObject(raw.usageToday);
  const usageWeekPayload = asObject(raw.usageWeek);
  const usageStatusPayload = asObject(raw.usageStatus);
  const cronListPayload = asObject(raw.cronList);
  const statusSessions = asObject(statusPayload?.sessions);

  const cronRunsEntries = pickArrayPayload(raw.cronRuns, [
    "entries",
    "runs",
    "items",
  ]);

  const jobs = asArray<JsonObject>(cronListPayload?.jobs);
  const runningJobByAgent = new Map<string, string>();
  for (const job of jobs) {
    const agentId = asString(job.agentId);
    const name = asString(job.name);
    const state = asObject(job.state);
    const runningAtMs = asNumber(state?.runningAtMs);

    if (agentId && name && runningAtMs) {
      runningJobByAgent.set(agentId, name);
    }
  }

  const statusByAgent = new Map<string, BridgeAgent["status"]>();
  const modelByAgent = new Map<string, string>();
  const statusByAgentRaw = asArray<JsonObject>(statusSessions?.byAgent);

  for (const entry of statusByAgentRaw) {
    const agentId = asString(entry.agentId);
    if (!agentId) {
      continue;
    }

    const recent = asArray<JsonObject>(entry.recent);
    const newest = recent.at(0);
    const updatedAt = asNumber(newest ? newest.updatedAt : null);
    const flags = asArray<string>(newest ? newest.flags : null);
    const model = asString(newest ? newest.model : null);

    if (model) {
      modelByAgent.set(agentId, model);
    }

    if (flags.includes("aborted")) {
      statusByAgent.set(agentId, "error");
      continue;
    }

    if (updatedAt && Date.now() - updatedAt <= 5 * 60 * 1000) {
      statusByAgent.set(agentId, "busy");
      continue;
    }

    statusByAgent.set(agentId, "idle");
  }

  const listedAgents = asArray<JsonObject>(agentsPayload?.agents);
  const agents: BridgeAgent[] = listedAgents.map((entry) => {
    const id = asString(entry.id) ?? randomUUID();
    const name = asString(entry.name) ?? asString(asObject(entry.identity)?.name) ?? id;

    return {
      id,
      name,
      role: "Agent",
      avatarUrl: asString(asObject(entry.identity)?.avatarUrl) ?? null,
      model: modelByAgent.get(id) ?? "unknown",
      status: statusByAgent.get(id) ?? (runningJobByAgent.has(id) ? "busy" : "idle"),
      currentTask: runningJobByAgent.get(id) ?? null,
    };
  });

  const recentTaskRuns: RecentTaskRun[] = cronRunsEntries.slice(0, 8).map((entry, idx) => {
    const jobId = asString(entry.jobId) ?? `job-${idx}`;
    const jobName = asString(entry.jobName) ?? jobId;
    const startedAtMs = asNumber(entry.runAtMs) ?? asNumber(entry.ts);
    const durationMs = asNumber(entry.durationMs);
    const agentMatch = jobs.find((job) => asString(job.id) === jobId);
    const agentId = asString(agentMatch ? agentMatch.agentId : null) ?? "unknown";
    const knownAgent = agents.find((agent) => agent.id === agentId);
    const agentName = knownAgent ? knownAgent.name : agentId === "unknown" ? "Unknown" : agentId;
    const startedAt = nowIsoFromMs(startedAtMs);

    return {
      id: `run-${jobId}-${startedAtMs ?? idx}`,
      taskName: jobName,
      agentId,
      agentName,
      status: normalizeTaskRunStatus(entry.status),
      startedAt,
      completedAt: durationMs && startedAtMs ? nowIsoFromMs(startedAtMs + durationMs) : null,
      error: asString(entry.error),
    };
  });

  const providerStatusEntries = asArray<JsonObject>(usageStatusPayload?.providers);

  const providerModels = new Map<string, string[]>();
  const statusRecent = asArray<JsonObject>(statusSessions?.recent);
  for (const row of statusRecent) {
    const provider = asString(row.modelProvider);
    const model = asString(row.model);

    if (!provider || !model) {
      continue;
    }

    const current = providerModels.get(provider) ?? [];
    if (!current.includes(model)) {
      current.push(model);
    }

    providerModels.set(provider, current);
  }

  const providers: Provider[] = providerStatusEntries.map((entry) => {
    const providerId = asString(entry.provider) ?? randomUUID();

    return {
      id: providerId,
      name: asString(entry.displayName) ?? providerId,
      status: normalizeProviderStatus(entry),
      latencyMs: 0,
      models: providerModels.get(providerId) ?? [],
    };
  });

  const recentErrors = recentTaskRuns
    .filter((run) => run.status === "failed" && run.error)
    .slice(0, 4)
    .map((run, idx) => ({
      id: `err-task-${idx}`,
      level: "error" as const,
      message: run.error ?? "Task failed",
      agentId: run.agentId,
      agentName: run.agentName,
      taskName: run.taskName,
      occurredAt: run.completedAt ?? run.startedAt,
    }));

  const providerErrors = providerStatusEntries
    .filter((entry) => asString(entry.error))
    .slice(0, 4)
    .map((entry, idx) => ({
      id: `err-provider-${idx}`,
      level: "warning" as const,
      message: asString(entry.error) ?? "Provider error",
      agentId: null,
      agentName: null,
      taskName: null,
      occurredAt: new Date().toISOString(),
    }));

  const uptimeSeconds = Math.max(
    0,
    Math.floor((asNumber(raw.hello?.snapshot?.uptimeMs) ?? 0) / 1000),
  );

  const systemHealth: SystemHealth = {
    openclaw: {
      status: inferOpenClawStatus({
        uptimeSeconds,
        hadError: providerErrors.length > 0,
      }),
      uptimeSeconds,
      version: asString(raw.hello?.server?.version) ?? "unknown",
    },
    providers,
    recentErrors: [...recentErrors, ...providerErrors].slice(0, 6),
  };

  const todayTotals = asObject(usageTodayPayload?.totals);
  const weekTotals = asObject(usageWeekPayload?.totals);

  return {
    agents,
    recentTaskRuns,
    systemHealth,
    usageSnapshot: {
      today: {
        costUsd: asNumber(todayTotals?.totalCost) ?? 0,
        tokens: Math.round(asNumber(todayTotals?.totalTokens) ?? 0),
        conversations: Math.max(0, asArray(asObject(usageTodayPayload)?.sessions).length),
      },
      thisWeek: {
        costUsd: asNumber(weekTotals?.totalCost) ?? 0,
        tokens: Math.round(asNumber(weekTotals?.totalTokens) ?? 0),
        conversations: Math.max(0, asArray(asObject(usageWeekPayload)?.sessions).length),
      },
    },
  };
}

export function createDegradedBridgeResponse(reason: string): BridgeResponse {
  const occurredAt = new Date().toISOString();

  return {
    agents: [],
    recentTaskRuns: [],
    systemHealth: {
      openclaw: {
        status: "error",
        uptimeSeconds: 0,
        version: "unknown",
      },
      providers: [],
      recentErrors: [
        {
          id: "err-degraded-0",
          level: "warning",
          message: reason,
          agentId: null,
          agentName: null,
          taskName: null,
          occurredAt,
        },
      ],
    },
    usageSnapshot: {
      today: {
        costUsd: 0,
        tokens: 0,
        conversations: 0,
      },
      thisWeek: {
        costUsd: 0,
        tokens: 0,
        conversations: 0,
      },
    },
  };
}

import type {
  AgentUsage,
  ModelUsage,
  TimeSeriesPoint,
  UsageQuery,
  UsageResponse,
} from "@uss/shared";
import type { UsageGatewayRawPayload } from "./usage.model.js";

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseIsoDayToUtcStartMs(isoDay: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return Date.UTC(year, month, day);
}

function formatUtcDay(ms: number): string {
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildModelRef(provider: string | null, model: string | null): string {
  if (model && model.includes("/")) {
    return model;
  }

  if (provider && model) {
    return `${provider}/${model}`;
  }

  if (model) {
    return model;
  }

  return "unknown";
}

function parseAgentIdFromSessionKey(key: string | null): string | null {
  if (!key) {
    return null;
  }

  const match = /^agent:([^:]+):/.exec(key);
  return match?.[1] ?? null;
}

function resolveCronRunMs(run: unknown): number | null {
  const obj = asObject(run);
  return asNumber(obj?.runAtMs) ?? asNumber(obj?.ts);
}

function resolveRunModelRef(run: unknown, cronJobById: Map<string, Record<string, unknown>>): string {
  const runObj = asObject(run);
  const provider = asString(runObj?.provider);
  const model = asString(runObj?.model);

  if (provider || model) {
    return buildModelRef(provider, model);
  }

  const jobId = asString(runObj?.jobId);
  if (!jobId) {
    return "unknown";
  }

  const job = cronJobById.get(jobId);
  const payload = asObject(job?.payload);
  const payloadModel = asString(payload?.model);
  if (!payloadModel) {
    return "unknown";
  }

  return payloadModel.includes("/") ? payloadModel : buildModelRef(null, payloadModel);
}

function resolveSessionModelRef(session: Record<string, unknown>): string {
  const provider =
    asString(session.modelProvider) ??
    asString(session.providerOverride) ??
    asString(session.usageProvider);

  const model =
    asString(session.model) ??
    asString(session.modelOverride) ??
    asString(session.usageModel);

  return buildModelRef(provider, model);
}

function buildTimeSeries(params: {
  startDate: string;
  endDate: string;
  daily: Record<string, unknown>[];
}): TimeSeriesPoint[] {
  const dailyEntries = params.daily
    .map((row) => ({
      date: asString(row.date),
      cost: asNumber(row.cost) ?? 0,
      tokens: Math.round(asNumber(row.tokens) ?? 0),
    }))
    .filter((row): row is { date: string; cost: number; tokens: number } => Boolean(row.date));

  if (dailyEntries.length === 0) {
    return [];
  }

  const byDate = new Map(
    dailyEntries.map((row) => [
      row.date,
      {
        cost: row.cost,
        tokens: row.tokens,
      },
    ]),
  );

  const startMs = parseIsoDayToUtcStartMs(params.startDate);
  const endMs = parseIsoDayToUtcStartMs(params.endDate);
  if (startMs === null || endMs === null || startMs > endMs) {
    return dailyEntries.sort((a, b) => a.date.localeCompare(b.date));
  }

  const points: TimeSeriesPoint[] = [];
  for (let dayMs = startMs; dayMs <= endMs; dayMs += 24 * 60 * 60 * 1000) {
    const date = formatUtcDay(dayMs);
    const existing = byDate.get(date);
    points.push({
      date,
      cost: existing?.cost ?? 0,
      tokens: existing?.tokens ?? 0,
    });
  }

  return points;
}

function buildModelNameResolver(modelsList: unknown): (modelId: string) => string {
  const models = asArray<Record<string, unknown>>(asObject(modelsList)?.models);
  const exact = new Map<string, string>();
  const byId = new Map<string, string>();

  for (const row of models) {
    const id = asString(row.id);
    if (!id) {
      continue;
    }

    const provider = asString(row.provider);
    const name = asString(row.name) ?? id;

    byId.set(id, name);
    if (id.includes("/")) {
      exact.set(id, name);
    } else if (provider) {
      exact.set(`${provider}/${id}`, name);
    }
  }

  return (modelId: string) => {
    const exactName = exact.get(modelId);
    if (exactName) {
      return exactName;
    }

    const tail = modelId.includes("/") ? modelId.split("/").at(1) : modelId;
    if (tail) {
      return byId.get(tail) ?? modelId;
    }

    return modelId;
  };
}

function buildAgentNameMap(agentsList: unknown): Map<string, string> {
  const rows = asArray<Record<string, unknown>>(asObject(agentsList)?.agents);
  const map = new Map<string, string>();

  for (const row of rows) {
    const id = asString(row.id);
    if (!id) {
      continue;
    }

    const identity = asObject(row.identity);
    map.set(id, asString(row.name) ?? asString(identity?.name) ?? id);
  }

  return map;
}

function extractSessionsUpdatedAtMs(sessionsUsage: unknown): number | null {
  return asNumber(asObject(sessionsUsage)?.updatedAt);
}

export function mapUsagePayload(params: {
  query: UsageQuery;
  raw: UsageGatewayRawPayload;
}): { payload: UsageResponse; sourceUpdatedAtMs: number | null } {
  const sessionsUsageObj = asObject(params.raw.sessionsUsage);
  const sessions = asArray<Record<string, unknown>>(sessionsUsageObj?.sessions);
  const aggregates = asObject(sessionsUsageObj?.aggregates);

  const totals = asObject(sessionsUsageObj?.totals);
  const daily = asArray<Record<string, unknown>>(aggregates?.daily);
  const byAgent = asArray<Record<string, unknown>>(aggregates?.byAgent);
  const byModel = asArray<Record<string, unknown>>(aggregates?.byModel);

  const agentNameById = buildAgentNameMap(params.raw.agentsList);
  const resolveModelName = buildModelNameResolver(params.raw.modelsList);

  const startMs = parseIsoDayToUtcStartMs(params.query.startDate) ?? 0;
  const endMs = (parseIsoDayToUtcStartMs(params.query.endDate) ?? 0) + (24 * 60 * 60 * 1000 - 1);

  const cronJobs = params.raw.cronJobs
    .map((row) => asObject(row))
    .filter((row): row is Record<string, unknown> => row !== null);

  const cronJobById = new Map<string, Record<string, unknown>>();
  for (const job of cronJobs) {
    const id = asString(job.id);
    if (id) {
      cronJobById.set(id, job);
    }
  }

  const cronRunsInRange = params.raw.cronRuns
    .map((row) => asObject(row))
    .filter((row): row is Record<string, unknown> => row !== null)
    .filter((run) => {
      const runMs = resolveCronRunMs(run);
      if (runMs === null) {
        return false;
      }

      return runMs >= startMs && runMs <= endMs;
    });

  const conversationByAgent = new Map<string, number>();
  const conversationByModel = new Map<string, number>();

  for (const session of sessions) {
    const agentId = asString(session.agentId) ?? parseAgentIdFromSessionKey(asString(session.key));
    if (agentId) {
      conversationByAgent.set(agentId, (conversationByAgent.get(agentId) ?? 0) + 1);
    }

    const modelRef = resolveSessionModelRef(session);
    conversationByModel.set(modelRef, (conversationByModel.get(modelRef) ?? 0) + 1);
  }

  const taskRunsByAgent = new Map<string, number>();
  const taskRunsByModel = new Map<string, number>();

  for (const run of cronRunsInRange) {
    const jobId = asString(run.jobId);
    const job = jobId ? cronJobById.get(jobId) : null;
    const agentId = asString(job?.agentId);

    if (agentId) {
      taskRunsByAgent.set(agentId, (taskRunsByAgent.get(agentId) ?? 0) + 1);
    }

    const modelRef = resolveRunModelRef(run, cronJobById);
    taskRunsByModel.set(modelRef, (taskRunsByModel.get(modelRef) ?? 0) + 1);
  }

  const costTokensByAgent = new Map<string, { cost: number; tokens: number }>();
  for (const row of byAgent) {
    const agentId = asString(row.agentId);
    if (!agentId) {
      continue;
    }

    const rowTotals = asObject(row.totals);
    costTokensByAgent.set(agentId, {
      cost: asNumber(rowTotals?.totalCost) ?? 0,
      tokens: Math.round(asNumber(rowTotals?.totalTokens) ?? 0),
    });
  }

  const costTokensByModel = new Map<string, { cost: number; tokens: number }>();
  for (const row of byModel) {
    const provider = asString(row.provider);
    const model = asString(row.model);
    const modelRef = buildModelRef(provider, model);
    const rowTotals = asObject(row.totals);

    costTokensByModel.set(modelRef, {
      cost: asNumber(rowTotals?.totalCost) ?? 0,
      tokens: Math.round(asNumber(rowTotals?.totalTokens) ?? 0),
    });
  }

  const agentIds = new Set<string>([
    ...costTokensByAgent.keys(),
    ...conversationByAgent.keys(),
    ...taskRunsByAgent.keys(),
  ]);

  const agents: AgentUsage[] = Array.from(agentIds).map((agentId) => {
    const usage = costTokensByAgent.get(agentId) ?? { cost: 0, tokens: 0 };

    return {
      agentId,
      agentName: agentNameById.get(agentId) ?? agentId,
      cost: usage.cost,
      totalTokens: usage.tokens,
      conversationCount: conversationByAgent.get(agentId) ?? 0,
      taskRunCount: taskRunsByAgent.get(agentId) ?? 0,
    };
  });

  const modelIds = new Set<string>([
    ...costTokensByModel.keys(),
    ...conversationByModel.keys(),
    ...taskRunsByModel.keys(),
  ]);

  const modelBreakdown: ModelUsage[] = Array.from(modelIds).map((modelId) => {
    const usage = costTokensByModel.get(modelId) ?? { cost: 0, tokens: 0 };

    return {
      modelId,
      modelName: resolveModelName(modelId),
      cost: usage.cost,
      totalTokens: usage.tokens,
      conversationCount: conversationByModel.get(modelId) ?? 0,
      taskRunCount: taskRunsByModel.get(modelId) ?? 0,
    };
  });

  const payload: UsageResponse = {
    startDate: params.query.startDate,
    endDate: params.query.endDate,
    summary: {
      totalCost: asNumber(totals?.totalCost) ?? 0,
      totalTokens: Math.round(asNumber(totals?.totalTokens) ?? 0),
      conversationCount: sessions.length,
      taskRunCount: cronRunsInRange.length,
    },
    timeSeries: buildTimeSeries({
      startDate: params.query.startDate,
      endDate: params.query.endDate,
      daily,
    }),
    agents,
    modelBreakdown,
  };

  return {
    payload,
    sourceUpdatedAtMs: extractSessionsUpdatedAtMs(params.raw.sessionsUsage),
  };
}

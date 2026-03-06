import type { UsageQuery, UsageResponse } from "@uss/shared";
import { logger, type Logger } from "../../infra/logging/logger.js";
import {
  usageGatewayRepository,
  type UsageGatewayRepository,
} from "./usage.gateway.repository.js";
import { usageCacheRepository, type UsageCacheRepository } from "./usage.cache.repository.js";
import { mapUsagePayload } from "./usage.mapper.js";
import type { UsageGatewayRawPayload } from "./usage.model.js";

type UsageLogger = Pick<Logger, "error" | "warn">;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_FALLBACK_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CACHE_PRUNE_MAX_AGE_MS = 30 * ONE_DAY_MS;

export type UsageService = {
  loadUsage: (query: UsageQuery) => Promise<UsageResponse>;
};

export type UsageServiceDeps = {
  gatewayRepository: UsageGatewayRepository;
  cacheRepository: UsageCacheRepository;
  logger: UsageLogger;
};

function normalizeQuery(query: UsageQuery): UsageQuery {
  return {
    startDate: query.startDate,
    endDate: query.endDate,
    mode: query.mode ?? "gateway",
    utcOffset: query.utcOffset,
  };
}

function parseIsoDayStartMs(isoDay: string): number | null {
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

function computeRangeDays(query: UsageQuery): number {
  const startMs = parseIsoDayStartMs(query.startDate);
  const endMs = parseIsoDayStartMs(query.endDate);
  if (startMs === null || endMs === null || endMs < startMs) {
    return 1;
  }

  return Math.max(1, Math.floor((endMs - startMs) / ONE_DAY_MS) + 1);
}

function resolveTtlMs(rangeDays: number): number {
  if (rangeDays <= 7) {
    return 30_000;
  }

  if (rangeDays <= 31) {
    return 120_000;
  }

  if (rangeDays <= 180) {
    return 300_000;
  }

  return 900_000;
}

function buildCacheKey(query: UsageQuery): string {
  return [
    query.startDate,
    query.endDate,
    query.mode ?? "gateway",
    query.utcOffset ?? "",
  ].join("|");
}

async function fetchUsageRawPayload(
  repository: UsageGatewayRepository,
  query: UsageQuery,
): Promise<UsageGatewayRawPayload> {
  const sessionsUsage = await repository.fetchSessionsUsage(query);

  const [cronJobsResult, cronRunsResult, agentsListResult, modelsListResult] = await Promise.allSettled([
    repository.fetchAllCronJobs(),
    repository.fetchAllCronRuns(),
    repository.fetchAgentsList(),
    repository.fetchModelsList(),
  ]);

  return {
    sessionsUsage,
    cronJobs: cronJobsResult.status === "fulfilled" ? cronJobsResult.value : [],
    cronRuns: cronRunsResult.status === "fulfilled" ? cronRunsResult.value : [],
    agentsList: agentsListResult.status === "fulfilled" ? agentsListResult.value : { agents: [] },
    modelsList: modelsListResult.status === "fulfilled" ? modelsListResult.value : { models: [] },
  };
}

export function createUsageService(deps: UsageServiceDeps): UsageService {
  return {
    async loadUsage(query): Promise<UsageResponse> {
      const normalizedQuery = normalizeQuery(query);
      const cacheKey = buildCacheKey(normalizedQuery);
      const now = Date.now();
      const rangeDays = computeRangeDays(normalizedQuery);
      const ttlMs = resolveTtlMs(rangeDays);

      const cached = await deps.cacheRepository.loadByKey(cacheKey);
      if (cached && now <= cached.expiresAtMs) {
        return cached.payload;
      }

      try {
        const raw = await fetchUsageRawPayload(deps.gatewayRepository, normalizedQuery);
        const mapped = mapUsagePayload({
          query: normalizedQuery,
          raw,
        });

        const fetchedAtMs = Date.now();

        await deps.cacheRepository.save({
          cacheKey,
          query: normalizedQuery,
          payload: mapped.payload,
          fetchedAtMs,
          expiresAtMs: fetchedAtMs + ttlMs,
          sourceUpdatedAtMs: mapped.sourceUpdatedAtMs,
          rangeDays,
        });

        await deps.cacheRepository.pruneBefore(fetchedAtMs - CACHE_PRUNE_MAX_AGE_MS);

        return mapped.payload;
      } catch (error) {
        deps.logger.error({ error }, "Usage live fetch failed");

        if (cached && now - cached.fetchedAtMs <= CACHE_FALLBACK_MAX_AGE_MS) {
          deps.logger.warn("Returning cached usage fallback");
          return cached.payload;
        }

        throw error;
      }
    },
  };
}

export const usageService = createUsageService({
  gatewayRepository: usageGatewayRepository,
  cacheRepository: usageCacheRepository,
  logger: logger.child({ module: "usage" }),
});

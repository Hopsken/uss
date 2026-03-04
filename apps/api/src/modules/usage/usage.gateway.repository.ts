import { gatewayClient } from "../../infra/gateway/client.js";
import type { UsageQuery } from "@uss/shared";

const PAGE_LIMIT = 200;

type CronPage = {
  jobs?: unknown[];
  entries?: unknown[];
  hasMore?: boolean;
  nextOffset?: number | null;
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function shouldContinue(page: CronPage, collected: number): boolean {
  if (page.hasMore === true) {
    return true;
  }

  const nextOffset = asNumber(page.nextOffset);
  if (nextOffset !== null) {
    return nextOffset > collected;
  }

  return false;
}

export type UsageGatewayRepository = {
  fetchSessionsUsage: (query: UsageQuery) => Promise<unknown>;
  fetchAllCronJobs: () => Promise<unknown[]>;
  fetchAllCronRuns: () => Promise<unknown[]>;
  fetchAgentsList: () => Promise<unknown>;
  fetchModelsList: () => Promise<unknown>;
};

export const usageGatewayRepository: UsageGatewayRepository = {
  async fetchSessionsUsage(query): Promise<unknown> {
    await gatewayClient.ensureConnected();

    const mode = query.mode ?? "gateway";
    const params: Record<string, unknown> = {
      startDate: query.startDate,
      endDate: query.endDate,
      mode,
      limit: Number.MAX_SAFE_INTEGER,
    };

    if (mode === "specific" && query.utcOffset) {
      params.utcOffset = query.utcOffset;
    }

    return gatewayClient.request("sessions.usage", params);
  },

  async fetchAllCronJobs(): Promise<unknown[]> {
    await gatewayClient.ensureConnected();

    const jobs: unknown[] = [];
    let offset = 0;

    for (let pageCount = 0; pageCount < 200; pageCount++) {
      const payload = await gatewayClient.request("cron.list", {
        includeDisabled: true,
        limit: PAGE_LIMIT,
        offset,
      });
      const obj = asObject(payload);
      const pageJobs = asArray(obj?.jobs);
      jobs.push(...pageJobs);

      const hasMore = shouldContinue(obj as CronPage, jobs.length);
      if (!hasMore || pageJobs.length === 0) {
        break;
      }

      const nextOffset = asNumber(obj?.nextOffset);
      offset = nextOffset !== null ? nextOffset : offset + pageJobs.length;
    }

    return jobs;
  },

  async fetchAllCronRuns(): Promise<unknown[]> {
    await gatewayClient.ensureConnected();

    const entries: unknown[] = [];
    let offset = 0;

    for (let pageCount = 0; pageCount < 500; pageCount++) {
      const payload = await gatewayClient.request("cron.runs", {
        scope: "all",
        sortDir: "desc",
        limit: PAGE_LIMIT,
        offset,
      });
      const obj = asObject(payload);
      const pageEntries = asArray(obj?.entries);
      entries.push(...pageEntries);

      const hasMore = shouldContinue(obj as CronPage, entries.length);
      if (!hasMore || pageEntries.length === 0) {
        break;
      }

      const nextOffset = asNumber(obj?.nextOffset);
      offset = nextOffset !== null ? nextOffset : offset + pageEntries.length;
    }

    return entries;
  },

  async fetchAgentsList(): Promise<unknown> {
    await gatewayClient.ensureConnected();
    return gatewayClient.request("agents.list", {});
  },

  async fetchModelsList(): Promise<unknown> {
    await gatewayClient.ensureConnected();
    return gatewayClient.request("models.list", {});
  },
};

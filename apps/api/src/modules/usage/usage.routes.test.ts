import test from "node:test";
import assert from "node:assert/strict";
import { Elysia } from "elysia";
import type { UsageResponse } from "@uss/shared";
import { createUsageRoutes } from "./usage.routes.js";

const usage: UsageResponse = {
  startDate: "2026-03-01",
  endDate: "2026-03-03",
  summary: {
    totalCost: 0,
    totalTokens: 0,
    conversationCount: 0,
    taskRunCount: 0,
  },
  timeSeries: [],
  agents: [],
  modelBreakdown: [],
};

test("GET /v1/usage returns usage payload", async () => {
  const app = new Elysia({ prefix: "/v1" }).use(
    createUsageRoutes({
      getUsage: async () => usage,
    }),
  );

  const response = await app.handle(
    new Request("http://localhost/v1/usage?startDate=2026-03-01&endDate=2026-03-03"),
  );
  const body = (await response.json()) as UsageResponse;

  assert.equal(response.status, 200);
  assert.equal(body.summary.totalCost, 0);
});

test("GET /v1/usage validates start/end ordering", async () => {
  const app = new Elysia({ prefix: "/v1" }).use(
    createUsageRoutes({
      getUsage: async () => usage,
    }),
  );

  const response = await app.handle(
    new Request("http://localhost/v1/usage?startDate=2026-03-04&endDate=2026-03-03"),
  );
  const body = (await response.json()) as { error: string };

  assert.equal(response.status, 400);
  assert.equal(body.error, "invalid_request");
});

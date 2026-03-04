import { t } from "elysia";

export type JsonObject = Record<string, unknown>;

export type UsageGatewayRawPayload = {
  sessionsUsage: unknown;
  cronJobs: unknown[];
  cronRuns: unknown[];
  agentsList: unknown;
  modelsList: unknown;
};

export const usageDateModeSchema = t.Union([
  t.Literal("gateway"),
  t.Literal("utc"),
  t.Literal("specific"),
]);

export const usageQuerySchema = t.Object({
  startDate: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  endDate: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  mode: t.Optional(usageDateModeSchema),
  utcOffset: t.Optional(t.String({ pattern: "^UTC[+-]\\d{1,2}(?::[0-5]\\d)?$" })),
});

const usageSummarySchema = t.Object({
  totalCost: t.Number(),
  totalTokens: t.Number(),
  conversationCount: t.Number(),
  taskRunCount: t.Number(),
});

const timeSeriesPointSchema = t.Object({
  date: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  cost: t.Number(),
  tokens: t.Number(),
});

const agentUsageSchema = t.Object({
  agentId: t.String(),
  agentName: t.String(),
  cost: t.Number(),
  totalTokens: t.Number(),
  conversationCount: t.Number(),
  taskRunCount: t.Number(),
});

const modelUsageSchema = t.Object({
  modelId: t.String(),
  modelName: t.String(),
  cost: t.Number(),
  totalTokens: t.Number(),
  conversationCount: t.Number(),
  taskRunCount: t.Number(),
});

export const usageResponseSchema = t.Object({
  startDate: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  endDate: t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
  summary: usageSummarySchema,
  timeSeries: t.Array(timeSeriesPointSchema),
  agents: t.Array(agentUsageSchema),
  modelBreakdown: t.Array(modelUsageSchema),
});

export const usageBadRequestSchema = t.Object({
  error: t.Literal("invalid_request"),
});

import { t } from "elysia";
import type { GatewayHelloOk } from "@uss/gateway-client";

export type JsonObject = Record<string, unknown>;

export type BridgeRawPayload = {
  hello: GatewayHelloOk | null;
  agentsList: unknown;
  status: unknown;
  usageToday: unknown;
  usageWeek: unknown;
  usageStatus: unknown;
  cronRuns: unknown;
  cronList: unknown;
};

const bridgeAgentSchema = t.Object({
  id: t.String(),
  name: t.String(),
  role: t.String(),
  avatarUrl: t.Nullable(t.String()),
  model: t.String(),
  status: t.Union([t.Literal("idle"), t.Literal("busy"), t.Literal("error")]),
  currentTask: t.Nullable(t.String()),
});

const taskRunStatusSchema = t.Union([
  t.Literal("running"),
  t.Literal("completed"),
  t.Literal("failed"),
  t.Literal("scheduled"),
]);

const providerStatusSchema = t.Union([
  t.Literal("healthy"),
  t.Literal("degraded"),
  t.Literal("down"),
]);

const errorLevelSchema = t.Union([t.Literal("error"), t.Literal("warning")]);

export const bridgeResponseSchema = t.Object({
  agents: t.Array(bridgeAgentSchema),
  recentTaskRuns: t.Array(
    t.Object({
      id: t.String(),
      taskName: t.String(),
      agentId: t.String(),
      agentName: t.String(),
      status: taskRunStatusSchema,
      startedAt: t.String({ format: "date-time" }),
      completedAt: t.Nullable(t.String({ format: "date-time" })),
      error: t.Nullable(t.String()),
    }),
  ),
  systemHealth: t.Object({
    openclaw: t.Object({
      status: t.Union([
        t.Literal("running"),
        t.Literal("stopped"),
        t.Literal("error"),
      ]),
      uptimeSeconds: t.Number({ minimum: 0 }),
      version: t.String(),
    }),
    providers: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        status: providerStatusSchema,
        latencyMs: t.Number(),
        models: t.Array(t.String()),
      }),
    ),
    recentErrors: t.Array(
      t.Object({
        id: t.String(),
        level: errorLevelSchema,
        message: t.String(),
        agentId: t.Nullable(t.String()),
        agentName: t.Nullable(t.String()),
        taskName: t.Nullable(t.String()),
        occurredAt: t.String({ format: "date-time" }),
      }),
    ),
  }),
  usageSnapshot: t.Object({
    today: t.Object({
      costUsd: t.Number(),
      tokens: t.Number(),
      conversations: t.Number(),
    }),
    thisWeek: t.Object({
      costUsd: t.Number(),
      tokens: t.Number(),
      conversations: t.Number(),
    }),
  }),
});

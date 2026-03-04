import { Elysia } from "elysia";
import type { UsageQuery, UsageResponse } from "@uss/shared";
import { usageController } from "./usage.controller.js";
import { usageBadRequestSchema, usageQuerySchema, usageResponseSchema } from "./usage.model.js";

type UsageRouteController = {
  getUsage: (query: UsageQuery) => Promise<UsageResponse>;
};

function isRangeValid(query: UsageQuery): boolean {
  const startMs = Date.parse(`${query.startDate}T00:00:00.000Z`);
  const endMs = Date.parse(`${query.endDate}T00:00:00.000Z`);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return false;
  }

  return startMs <= endMs;
}

export function createUsageRoutes(controller: UsageRouteController = usageController) {
  return new Elysia({ name: "usage-routes" }).get(
    "/usage",
    async ({ query, set }) => {
      if (!isRangeValid(query)) {
        set.status = 400;
        return { error: "invalid_request" };
      }

      return controller.getUsage(query);
    },
    {
      query: usageQuerySchema,
      response: {
        200: usageResponseSchema,
        400: usageBadRequestSchema,
      },
    },
  );
}

export const usageRoutes = createUsageRoutes();

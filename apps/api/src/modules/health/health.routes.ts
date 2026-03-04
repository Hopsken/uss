import { Elysia } from "elysia";
import type { HealthResponse } from "@uss/shared";
import { healthController } from "./health.controller.js";
import { healthResponseSchema } from "./health.model.js";

type HealthRouteController = {
  getHealth: () => HealthResponse;
};

export function createHealthRoutes(controller: HealthRouteController = healthController) {
  return new Elysia({ name: "health-routes" }).get("/health", () => controller.getHealth(), {
    response: healthResponseSchema,
  });
}

export const healthRoutes = createHealthRoutes();

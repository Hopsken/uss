import { Elysia } from "elysia";
import { healthRoutes } from "../modules/health/health.routes.js";
import { bridgeRoutes } from "../modules/bridge/bridge.routes.js";
import { agentsRoutes } from "../modules/agents/agents.routes.js";
import { usageRoutes } from "../modules/usage/usage.routes.js";

export const v1Plugin = new Elysia({ name: "v1", prefix: "/v1" })
  .use(healthRoutes)
  .use(bridgeRoutes)
  .use(agentsRoutes)
  .use(usageRoutes);

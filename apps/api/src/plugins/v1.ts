import { Elysia } from "elysia";
import { enforceAuth } from "../modules/auth/auth.guard.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { healthRoutes } from "../modules/health/health.routes.js";
import { bridgeRoutes } from "../modules/bridge/bridge.routes.js";
import { agentsRoutes } from "../modules/agents/agents.routes.js";
import { usageRoutes } from "../modules/usage/usage.routes.js";
import { skillsRoutes } from "../modules/skills/skills.routes.js";
import { tasksRoutes } from "../modules/tasks/tasks.routes.js";

export const v1Plugin = new Elysia({ name: "v1", prefix: "/v1" })
  .onBeforeHandle(enforceAuth)
  .use(authRoutes)
  .use(healthRoutes)
  .use(bridgeRoutes)
  .use(agentsRoutes)
  .use(usageRoutes)
  .use(skillsRoutes)
  .use(tasksRoutes);

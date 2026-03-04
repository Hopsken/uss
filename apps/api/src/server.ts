import { buildApp } from "./app.js";
import { resolveApiEnv } from "./config/env.js";
import { shutdownGateway } from "./infra/gateway/client.js";
import { startTasksScheduler, stopTasksScheduler } from "./modules/tasks/tasks.scheduler.js";

function registerShutdownHooks(): void {
  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`[api] received ${signal}, shutting down`);
    stopTasksScheduler();
    shutdownGateway();
    process.exit(0);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

export function startServer(): void {
  const env = resolveApiEnv();
  const app = buildApp();

  app.listen(env.port);
  console.log(`[api] listening on http://localhost:${app.server?.port ?? env.port}`);

  startTasksScheduler();
  registerShutdownHooks();
}

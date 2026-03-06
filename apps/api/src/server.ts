import { buildApp } from "./app.js";
import { resolveApiEnv } from "./config/env.js";
import { shutdownGateway } from "./infra/gateway/client.js";
import { logger } from "./infra/logging/logger.js";
import { startTasksScheduler, stopTasksScheduler } from "./modules/tasks/tasks.scheduler.js";

const serverLogger = logger.child({ component: "server" });

function registerShutdownHooks(): void {
  const shutdown = (signal: NodeJS.Signals) => {
    serverLogger.info({ signal }, "server.shutdown");
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
  serverLogger.info({
    port: app.server?.port ?? env.port,
    url: `http://localhost:${app.server?.port ?? env.port}`,
  }, "server.started");

  startTasksScheduler();
  registerShutdownHooks();
}

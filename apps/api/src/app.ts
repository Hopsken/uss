import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { resolveApiEnv } from "./config/env.js";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { requestLoggerPlugin } from "./plugins/request-logger.js";
import { v1Plugin } from "./plugins/v1.js";

export function buildApp() {
  const env = resolveApiEnv();

  return new Elysia({ adapter: node() })
    .use(
      cors({
        origin: env.corsOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      }),
    )
    .use(requestLoggerPlugin)
    .use(errorHandlerPlugin)
    .use(v1Plugin);
}

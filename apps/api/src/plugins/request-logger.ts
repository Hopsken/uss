import { Elysia } from "elysia";
import { logger, type Logger } from "../infra/logging/logger.js";
import {
  endRequestContext,
  getRequestContext,
  startRequestContext,
} from "../infra/logging/request-context.js";

function getPathname(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

function resolveRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("cf-connecting-ip") ?? null;
}

function normalizeStatus(status: unknown): number {
  if (typeof status === "number" && Number.isFinite(status)) {
    return status;
  }

  if (typeof status === "string") {
    const parsed = Number(status);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 200;
}

export function getRequestLogger(request: Request): Logger {
  const context = getRequestContext(request) ?? startRequestContext(request);
  return logger.child({ requestId: context.requestId });
}

export const requestLoggerPlugin = new Elysia({ name: "request-logger" })
  .onRequest(({ request, set }: any) => {
    const context = startRequestContext(request);
    set.headers["x-request-id"] = context.requestId;

    logger.debug({
      requestId: context.requestId,
      method: request.method,
      path: getPathname(request.url),
      ip: resolveRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    }, "request.started");
  })
  .onAfterResponse(
    ({ path, request, set }: any) => {
      const context = endRequestContext(request) ?? startRequestContext(request);

      logger.info({
        requestId: context.requestId,
        method: request.method,
        path: path || getPathname(request.url),
        status: normalizeStatus(set.status),
        durationMs: Date.now() - context.startedAtMs,
        ip: resolveRequestIp(request),
      }, "request.completed");
    },
  );

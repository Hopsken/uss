import { randomUUID } from "node:crypto";

export type RequestContext = {
  requestId: string;
  startedAtMs: number;
};

const requestContextStore = new WeakMap<Request, RequestContext>();

export function startRequestContext(request: Request): RequestContext {
  const existing = requestContextStore.get(request);
  if (existing) {
    return existing;
  }

  const context = {
    requestId: request.headers.get("x-request-id")?.trim() || randomUUID(),
    startedAtMs: Date.now(),
  };

  requestContextStore.set(request, context);
  return context;
}

export function getRequestContext(request: Request): RequestContext | undefined {
  return requestContextStore.get(request);
}

export function endRequestContext(request: Request): RequestContext | undefined {
  const context = requestContextStore.get(request);
  requestContextStore.delete(request);
  return context;
}

import type { HealthResponse } from "@uss/shared";

export function createHealthPayload(): HealthResponse {
  return {
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  };
}

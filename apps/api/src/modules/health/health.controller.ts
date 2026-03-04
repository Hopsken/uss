import { createHealthPayload } from "./health.service.js";
import type { HealthResponse } from "@uss/shared";

export const healthController = {
  getHealth: (): HealthResponse => createHealthPayload(),
};

import type { UsageQuery, UsageResponse } from "@uss/shared";
import { usageService } from "./usage.service.js";

export const usageController = {
  getUsage: async (query: UsageQuery): Promise<UsageResponse> => await usageService.loadUsage(query),
};

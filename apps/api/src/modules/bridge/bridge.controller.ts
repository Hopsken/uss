import { bridgeService } from "./bridge.service.js";
import type { BridgeResponse } from "@uss/shared";

export const bridgeController = {
  getBridge: async (): Promise<BridgeResponse> => await bridgeService.loadBridgeData(),
};

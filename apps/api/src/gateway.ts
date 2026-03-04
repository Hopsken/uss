import { GatewayClient, resolveGatewayConfig } from "@uss/gateway-client";

export const gateway = new GatewayClient(resolveGatewayConfig());

import { GatewayClient, resolveGatewayConfig } from "@uss/gateway-client";

export const gatewayClient = new GatewayClient(resolveGatewayConfig());

export function shutdownGateway(): void {
  gatewayClient.close();
}

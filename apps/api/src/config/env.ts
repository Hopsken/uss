export type ApiEnv = {
  port: number;
  gatewayUrl: string;
};

export function resolveApiEnv(): ApiEnv {
  const rawPort = Number(process.env.API_PORT ?? 8787);

  return {
    port: Number.isFinite(rawPort) ? Math.max(1, rawPort) : 8787,
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL ?? "ws://localhost:18789",
  };
}

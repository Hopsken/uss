export type ApiEnv = {
  port: number;
  gatewayUrl: string;
  corsOrigins: string[];
};

export function resolveApiEnv(): ApiEnv {
  const rawPort = Number(process.env.API_PORT ?? 8787);
  const corsOrigins =
    process.env.API_CORS_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0) ?? ["http://localhost:3000"];

  return {
    port: Number.isFinite(rawPort) ? Math.max(1, rawPort) : 8787,
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL ?? "ws://localhost:18789",
    corsOrigins,
  };
}

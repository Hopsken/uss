export type ApiEnv = {
  port: number;
  gatewayUrl: string;
  corsOrigins: string[];
  auth: {
    secret: string;
    baseUrl: string;
    trustedOrigins: string[];
    passkeyRpId: string;
    passkeyOrigin: string;
    passkeyRpName: string;
    bootstrapResetSecret: string | null;
  };
};

function resolvePasskeyOrigin(corsOrigins: string[]): string {
  return corsOrigins[0] ?? "http://localhost:3000";
}

function resolvePasskeyRpId(origin: string): string {
  try {
    const url = new URL(origin);
    if (url.hostname === "127.0.0.1" || url.hostname === "::1") {
      return "localhost";
    }
    return url.hostname || "localhost";
  } catch {
    return "localhost";
  }
}

function resolveAuthSecret(): string {
  const configured = process.env.BETTER_AUTH_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }

  console.warn("[api] BETTER_AUTH_SECRET is not set, using local development fallback");
  return "uss-dev-only-better-auth-secret-change-me";
}

export function resolveApiEnv(): ApiEnv {
  const rawPort = Number(process.env.API_PORT ?? 8787);
  const corsOrigins =
    process.env.API_CORS_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0) ?? ["http://localhost:3000"];
  const port = Number.isFinite(rawPort) ? Math.max(1, rawPort) : 8787;
  const passkeyOrigin = resolvePasskeyOrigin(corsOrigins);

  return {
    port,
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL ?? "ws://localhost:18789",
    corsOrigins,
    auth: {
      secret: resolveAuthSecret(),
      baseUrl: process.env.BETTER_AUTH_BASE_URL ?? `http://localhost:${port}`,
      trustedOrigins: corsOrigins,
      passkeyRpId: resolvePasskeyRpId(passkeyOrigin),
      passkeyOrigin,
      passkeyRpName: "USS",
      bootstrapResetSecret: process.env.AUTH_BOOTSTRAP_RESET_SECRET?.trim() || null,
    },
  };
}

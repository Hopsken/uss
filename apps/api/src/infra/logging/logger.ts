import pino, { stdSerializers, type Logger as PinoLogger } from "pino";

type LogLevel = "debug" | "info" | "warn" | "error";

function resolveLogLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }

  if (process.env.NODE_ENV === "test") {
    return "warn";
  }

  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function resolveTransport() {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    return undefined;
  }

  return pino.transport({
    target: "pino-pretty",
    options: {
      singleLine: true,
      translateTime: "SYS:standard",
      colorize: false,
      ignore: "pid,hostname",
    },
  });
}

export type Logger = PinoLogger;

export const logger = pino(
  {
    level: resolveLogLevel(),
    enabled: process.env.LOG_ENABLED !== "false",
    base: { service: "api" },
    serializers: {
      err: stdSerializers.err,
      error: stdSerializers.err,
    },
  },
  resolveTransport(),
);

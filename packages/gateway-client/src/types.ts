export type GatewayReqFrame = {
  type: "req";
  id: string;
  method: string;
  params?: unknown;
};

export type GatewayResFrame = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: unknown;
};

export type GatewayEventFrame = {
  type: "event";
  event: string;
  payload?: unknown;
};

export type GatewayHelloOk = {
  protocol?: number;
  server?: { version?: string };
  snapshot?: { uptimeMs?: number };
};

export type GatewayFrame = GatewayResFrame | GatewayEventFrame | { type?: string };

export type GatewayConfig = {
  url: string;
  token: string | null;
  timeoutMs: number;
};

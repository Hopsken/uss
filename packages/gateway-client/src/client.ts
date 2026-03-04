import { randomUUID } from "node:crypto";
import type {
  GatewayConfig,
  GatewayEventFrame,
  GatewayHelloOk,
  GatewayReqFrame,
  GatewayResFrame,
} from "./types.js";

const PROTOCOL_VERSION = 3;

type PendingEntry = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

function toWsText(data: unknown): string {
  if (typeof data === "string") return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
  }
  return String(data);
}

export function resolveGatewayConfig(): GatewayConfig {
  const timeoutRaw = Number(process.env.OPENCLAW_GATEWAY_TIMEOUT_MS ?? 8000);
  return {
    url: process.env.OPENCLAW_GATEWAY_URL ?? "ws://localhost:18789",
    token: process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || null,
    timeoutMs: Number.isFinite(timeoutRaw) ? Math.max(1000, timeoutRaw) : 8000,
  };
}

export class GatewayClient {
  private config: GatewayConfig;
  private ws: WebSocket | null = null;
  private hello: GatewayHelloOk | null = null;
  private pending = new Map<string, PendingEntry>();
  private connectPromise: Promise<void> | null = null;
  private closed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private challengeResolve: ((nonce: string) => void) | null = null;
  private challengeReject: ((err: Error) => void) | null = null;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  get helloPayload(): GatewayHelloOk | null {
    return this.hello;
  }

  get isConnected(): boolean {
    return (
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN &&
      this.hello !== null
    );
  }

  async ensureConnected(): Promise<void> {
    if (this.isConnected) return;
    if (this.connectPromise) return this.connectPromise;
    this.connectPromise = this.doConnect()
      .then(() => {
        this.connectPromise = null;
        this.reconnectAttempt = 0;
      })
      .catch((err: unknown) => {
        this.connectPromise = null;
        throw err;
      });
    return this.connectPromise;
  }

  async request(method: string, params?: unknown): Promise<unknown> {
    await this.ensureConnected();
    return this.sendRequest(method, params);
  }

  close(): void {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.rejectAllPending("Gateway closed");
  }

  private rejectAllPending(reason: string): void {
    for (const waiter of this.pending.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error(reason));
    }
    this.pending.clear();
    if (this.challengeReject) {
      this.challengeReject(new Error(reason));
      this.challengeReject = null;
      this.challengeResolve = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    const delayMs = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 30000);
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.closed) {
        this.ensureConnected().catch(() => {
          // scheduleReconnect will be called again from doConnect failure
        });
      }
    }, delayMs);
  }

  private handleMessage(data: unknown): void {
    let frame: Record<string, unknown> | null = null;
    try {
      frame = JSON.parse(toWsText(data)) as Record<string, unknown>;
    } catch {
      return;
    }

    if (!frame || typeof frame !== "object") return;

    if (frame["type"] === "event") {
      const evtFrame = frame as unknown as GatewayEventFrame;
      if (evtFrame.event === "connect.challenge") {
        const payload = evtFrame.payload as Record<string, unknown> | null | undefined;
        const nonce = typeof payload?.["nonce"] === "string" ? payload["nonce"] : null;
        if (nonce && this.challengeResolve) {
          this.challengeResolve(nonce);
        }
      }
      return;
    }

    if (
      frame["type"] !== "res" ||
      typeof frame["id"] !== "string" ||
      typeof frame["ok"] !== "boolean"
    ) {
      return;
    }

    const resFrame = frame as unknown as GatewayResFrame;
    const waiter = this.pending.get(resFrame.id);
    if (!waiter) return;

    this.pending.delete(resFrame.id);
    clearTimeout(waiter.timer);

    if (!resFrame.ok) {
      waiter.reject(new Error(`Gateway method failed`));
      return;
    }

    waiter.resolve(resFrame.payload);
  }

  private sendRequest(method: string, params?: unknown): Promise<unknown> {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("Gateway not connected"));
    }

    return new Promise<unknown>((resolve, reject) => {
      const id = randomUUID();
      const frame: GatewayReqFrame = { type: "req", id, method, params };

      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Gateway request timeout: ${method}`));
      }, this.config.timeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      ws.send(JSON.stringify(frame));
    });
  }

  private async doConnect(): Promise<void> {
    if (this.closed) throw new Error("Gateway client is closed");

    const ws = new WebSocket(this.config.url);
    this.ws = ws;

    try {
      // 1. Wait for WS open
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          ws.removeEventListener("open", onOpen);
          ws.removeEventListener("error", onError);
          reject(new Error("Gateway open timeout"));
        }, this.config.timeoutMs);

        const onOpen = () => {
          clearTimeout(timer);
          ws.removeEventListener("error", onError);
          resolve();
        };

        const onError = (event: Event) => {
          clearTimeout(timer);
          ws.removeEventListener("open", onOpen);
          const err = "error" in event ? (event.error as unknown) : event;
          reject(err instanceof Error ? err : new Error(String(err)));
        };

        ws.addEventListener("open", onOpen, { once: true });
        ws.addEventListener("error", onError, { once: true });
      });

      // 2. Set up message handler
      ws.addEventListener("message", (event: MessageEvent) => {
        this.handleMessage(event.data);
      });

      // 3. Set up close handler
      ws.addEventListener("close", () => {
        if (this.ws === ws) {
          this.ws = null;
          this.hello = null;
          this.rejectAllPending("Gateway connection closed");
          if (!this.closed) {
            this.scheduleReconnect();
          }
        }
      });

      // 4. Wait for connect.challenge event
      await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          this.challengeResolve = null;
          this.challengeReject = null;
          reject(new Error("Gateway challenge timeout"));
        }, this.config.timeoutMs);

        this.challengeResolve = (nonce) => {
          clearTimeout(timer);
          this.challengeResolve = null;
          this.challengeReject = null;
          resolve(nonce);
        };

        this.challengeReject = (err) => {
          clearTimeout(timer);
          this.challengeResolve = null;
          this.challengeReject = null;
          reject(err);
        };
      });

      // 5. Send connect request
      const connectParams: Record<string, unknown> = {
        minProtocol: PROTOCOL_VERSION,
        maxProtocol: PROTOCOL_VERSION,
        client: {
          id: "gateway-client",
          displayName: "USS Bridge API",
          version: "0.1.0",
          platform: `node ${process.version}`,
          mode: "backend",
          instanceId: "uss-bridge-api",
        },
        role: "operator",
        scopes: ["operator.read"],
        caps: [],
        locale: "en-US",
        userAgent: "uss-bridge-api",
      };

      if (this.config.token) {
        connectParams["auth"] = { token: this.config.token };
      }

      // 6. Capture hello from response (bypass ensureConnected — WS is open but hello not set yet)
      const helloPayload = await this.sendRequest("connect", connectParams);
      this.hello = helloPayload as GatewayHelloOk;
    } catch (err) {
      // Clean up on failure so scheduleReconnect can retry
      if (this.ws === ws) {
        this.ws = null;
        this.hello = null;
      }
      ws.close();
      if (!this.closed) {
        this.scheduleReconnect();
      }
      throw err;
    }
  }
}

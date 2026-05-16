import { finnhubSocketManager } from "@/lib/websocket/finnhub";
import type { ProviderHealthStatus } from "@/lib/watchlist-ai/types";

export type ProviderStatus = "healthy" | "degraded" | "invalid-key" | "rate-limited" | "unavailable";

type ProviderRuntimeMetric = {
  provider: string;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastError?: string;
  lastLatencyMs?: number;
  retryCount: number;
  failureCount: number;
  rateLimitCount: number;
};

export type ProviderValidationResult = {
  provider: string;
  configured: boolean;
  keyPresent: boolean;
  status: ProviderStatus;
  reachable: boolean;
  latencyMs?: number;
  quotaRemaining?: number;
  quotaLimit?: number;
  websocketConnected?: boolean;
  websocketError?: string;
  stale: boolean;
  staleMs?: number;
  lastSuccessfulFetch?: string;
  lastFailureAt?: string;
  retryCount: number;
  failureCount: number;
  error?: string;
  messages: string[];
  checkedAt: string;
};

export type ProviderHealthReport = {
  generatedAt: string;
  overallStatus: ProviderStatus;
  websocket: {
    connected: boolean;
    reconnectAttempts: number;
    subscribedSymbols: number;
    lastConnectedAt?: string;
    lastMessageAt?: string;
    lastReconnectAt?: string;
    lastError?: string;
  };
  providers: ProviderValidationResult[];
};

const REQUEST_TIMEOUT_MS = Number(process.env.WATCHLIST_AI_PROVIDER_HEALTH_TIMEOUT_MS || 4500);
const CACHE_TTL_MS = Number(process.env.WATCHLIST_AI_PROVIDER_HEALTH_CACHE_MS || 20_000);
const STALE_AFTER_MS = Number(process.env.WATCHLIST_AI_STALE_FEED_MS || 90_000);

const runtimeMetrics = new Map<string, ProviderRuntimeMetric>();
let reportCache: { at: number; value: ProviderHealthReport } | null = null;
let startupValidationStarted = false;

function getMetric(provider: string): ProviderRuntimeMetric {
  const existing = runtimeMetrics.get(provider);
  if (existing) {
    return existing;
  }
  const next: ProviderRuntimeMetric = {
    provider,
    retryCount: 0,
    failureCount: 0,
    rateLimitCount: 0,
  };
  runtimeMetrics.set(provider, next);
  return next;
}

function nowIso(): string {
  return new Date().toISOString();
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error || "unknown_error");
}

function parseRateLimit(headers: Headers): { remaining?: number; limit?: number } {
  const remaining = Number(headers.get("x-ratelimit-remaining") || headers.get("x-rate-limit-remaining") || "");
  const limit = Number(headers.get("x-ratelimit-limit") || headers.get("x-rate-limit-limit") || "");
  return {
    remaining: Number.isFinite(remaining) ? remaining : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
  };
}

function classifyStatus(args: {
  configured: boolean;
  reachable: boolean;
  error?: string;
  hasSuccess: boolean;
}): ProviderStatus {
  if (!args.configured) {
    return "unavailable";
  }
  const message = (args.error || "").toLowerCase();
  if (message.includes("invalid") && message.includes("key")) {
    return "invalid-key";
  }
  if (message.includes("http 401") || message.includes("unauthorized")) {
    return "invalid-key";
  }
  if (message.includes("rate") && message.includes("limit")) {
    return "rate-limited";
  }
  if (message.includes("http 429") || message.includes("budget exhausted")) {
    return "rate-limited";
  }
  if (!args.reachable) {
    return "unavailable";
  }
  if (args.hasSuccess) {
    return "healthy";
  }
  return "degraded";
}

function staleInfo(lastSuccessAt?: string): { stale: boolean; staleMs?: number } {
  if (!lastSuccessAt) {
    return { stale: true };
  }
  const parsed = Date.parse(lastSuccessAt);
  if (!Number.isFinite(parsed)) {
    return { stale: true };
  }
  const age = Date.now() - parsed;
  return {
    stale: age > STALE_AFTER_MS,
    staleMs: age,
  };
}

async function fetchJson(url: string): Promise<{ response: Response; body: unknown; latencyMs: number }> {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    cache: "no-store",
    headers: {
      "User-Agent": "SphereVista360-ProviderHealth/1.0",
    },
  });
  clearTimeout(timeout);
  const body = (await response.json()) as unknown;
  return {
    response,
    body,
    latencyMs: Date.now() - startedAt,
  };
}

async function probeFinnhubWebSocket(apiKey: string): Promise<{ connected: boolean; error?: string }> {
  const wsFactory = globalThis.WebSocket;
  if (typeof wsFactory !== "function") {
    return { connected: false, error: "websocket_not_available" };
  }

  return new Promise((resolve) => {
    let resolved = false;
    const url = `wss://ws.finnhub.io?token=${apiKey}`;
    const socket = new wsFactory(url);

    const finish = (value: { connected: boolean; error?: string }) => {
      if (resolved) {
        return;
      }
      resolved = true;
      try {
        socket.close();
      } catch {
        // ignore close failures
      }
      resolve(value);
    };

    const timer = setTimeout(() => {
      finish({ connected: false, error: "websocket_timeout" });
    }, REQUEST_TIMEOUT_MS);

    socket.onopen = () => {
      clearTimeout(timer);
      finish({ connected: true });
    };

    socket.onerror = () => {
      clearTimeout(timer);
      finish({ connected: false, error: "websocket_error" });
    };
  });
}

async function validateFinnhub(metric: ProviderRuntimeMetric): Promise<ProviderValidationResult> {
  const provider = "Finnhub";
  const apiKey = process.env.FINNHUB_API_KEY || "";
  const keyPresent = Boolean(apiKey);
  const checkedAt = nowIso();
  const messages: string[] = [];

  if (!keyPresent) {
    return {
      provider,
      configured: false,
      keyPresent,
      status: "unavailable",
      reachable: false,
      stale: true,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: "missing_api_key",
      messages: ["FINNHUB_API_KEY is not configured."],
      checkedAt,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
    };
  }

  try {
    const { response, body, latencyMs } = await fetchJson(
      `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(apiKey)}`
    );
    const parsedBody = body as { error?: string; c?: number };
    const quota = parseRateLimit(response.headers);

    if (!response.ok) {
      throw new Error(`Finnhub HTTP ${response.status}`);
    }
    if (parsedBody?.error) {
      throw new Error(parsedBody.error);
    }
    if (!Number.isFinite(parsedBody?.c)) {
      messages.push("Quote payload missing latest price field.");
    }

    const wsProbe = await probeFinnhubWebSocket(apiKey);
    const stale = staleInfo(metric.lastSuccessAt);

    return {
      provider,
      configured: true,
      keyPresent,
      status: classifyStatus({ configured: true, reachable: true, hasSuccess: true }),
      reachable: true,
      latencyMs,
      quotaRemaining: quota.remaining,
      quotaLimit: quota.limit,
      websocketConnected: wsProbe.connected,
      websocketError: wsProbe.error,
      stale: stale.stale,
      staleMs: stale.staleMs,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: metric.lastError,
      messages,
      checkedAt,
    };
  } catch (error) {
    const message = toErrorMessage(error);
    const stale = staleInfo(metric.lastSuccessAt);
    return {
      provider,
      configured: true,
      keyPresent,
      status: classifyStatus({ configured: true, reachable: false, hasSuccess: false, error: message }),
      reachable: false,
      stale: stale.stale,
      staleMs: stale.staleMs,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: message,
      messages,
      checkedAt,
    };
  }
}

export async function validateFinnhubProvider(): Promise<ProviderValidationResult> {
  return validateFinnhub(getMetric("Finnhub"));
}

async function validateTwelveData(metric: ProviderRuntimeMetric): Promise<ProviderValidationResult> {
  const provider = "TwelveData";
  const apiKey = process.env.TWELVEDATA_API_KEY || "";
  const keyPresent = Boolean(apiKey);
  const checkedAt = nowIso();
  const messages: string[] = [];

  if (!keyPresent) {
    return {
      provider,
      configured: false,
      keyPresent,
      status: "unavailable",
      reachable: false,
      stale: true,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: "missing_api_key",
      messages: ["TWELVEDATA_API_KEY is not configured."],
      checkedAt,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
    };
  }

  try {
    const { response, body, latencyMs } = await fetchJson(
      `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=1&apikey=${encodeURIComponent(apiKey)}`
    );
    const parsedBody = body as { code?: number; status?: string; message?: string; values?: Array<{ close?: string }> };

    if (!response.ok) {
      throw new Error(`TwelveData HTTP ${response.status}`);
    }
    if (parsedBody.code || parsedBody.status === "error") {
      throw new Error(parsedBody.message || "TwelveData error response");
    }
    if (!Array.isArray(parsedBody.values) || parsedBody.values.length === 0) {
      messages.push("Time series returned without values.");
    }

    const stale = staleInfo(metric.lastSuccessAt);
    return {
      provider,
      configured: true,
      keyPresent,
      status: classifyStatus({ configured: true, reachable: true, hasSuccess: true }),
      reachable: true,
      latencyMs,
      stale: stale.stale,
      staleMs: stale.staleMs,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: metric.lastError,
      messages,
      checkedAt,
    };
  } catch (error) {
    const message = toErrorMessage(error);
    const stale = staleInfo(metric.lastSuccessAt);
    return {
      provider,
      configured: true,
      keyPresent,
      status: classifyStatus({ configured: true, reachable: false, hasSuccess: false, error: message }),
      reachable: false,
      stale: stale.stale,
      staleMs: stale.staleMs,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: message,
      messages,
      checkedAt,
    };
  }
}

export async function validateTwelveDataProvider(): Promise<ProviderValidationResult> {
  return validateTwelveData(getMetric("TwelveData"));
}

async function validateAlphaVantage(metric: ProviderRuntimeMetric): Promise<ProviderValidationResult> {
  const provider = "Alpha Vantage";
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "";
  const keyPresent = Boolean(apiKey);
  const checkedAt = nowIso();
  const messages: string[] = [];

  if (!keyPresent) {
    return {
      provider,
      configured: false,
      keyPresent,
      status: "unavailable",
      reachable: false,
      stale: true,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: "missing_api_key",
      messages: ["ALPHA_VANTAGE_API_KEY is not configured."],
      checkedAt,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
    };
  }

  try {
    const { response, body, latencyMs } = await fetchJson(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${encodeURIComponent(apiKey)}`
    );
    const parsedBody = body as {
      Note?: string;
      Information?: string;
      "Error Message"?: string;
      "Global Quote"?: Record<string, string>;
    };

    if (!response.ok) {
      throw new Error(`AlphaVantage HTTP ${response.status}`);
    }
    if (parsedBody["Error Message"]) {
      throw new Error(parsedBody["Error Message"]);
    }
    if (parsedBody.Note) {
      throw new Error(parsedBody.Note);
    }

    const quote = parsedBody["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      if (parsedBody.Information) {
        messages.push(parsedBody.Information);
      }
      throw new Error(parsedBody.Information || "AlphaVantage response missing quote payload");
    }

    const stale = staleInfo(metric.lastSuccessAt);
    return {
      provider,
      configured: true,
      keyPresent,
      status: classifyStatus({ configured: true, reachable: true, hasSuccess: true }),
      reachable: true,
      latencyMs,
      stale: stale.stale,
      staleMs: stale.staleMs,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: metric.lastError,
      messages,
      checkedAt,
    };
  } catch (error) {
    const message = toErrorMessage(error);
    const stale = staleInfo(metric.lastSuccessAt);
    return {
      provider,
      configured: true,
      keyPresent,
      status: classifyStatus({ configured: true, reachable: false, hasSuccess: false, error: message }),
      reachable: false,
      stale: stale.stale,
      staleMs: stale.staleMs,
      lastSuccessfulFetch: metric.lastSuccessAt,
      lastFailureAt: metric.lastFailureAt,
      retryCount: metric.retryCount,
      failureCount: metric.failureCount,
      error: message,
      messages,
      checkedAt,
    };
  }
}

export async function validateAlphaVantageProvider(): Promise<ProviderValidationResult> {
  return validateAlphaVantage(getMetric("Alpha Vantage"));
}

function computeOverallStatus(providers: ProviderValidationResult[]): ProviderStatus {
  const configured = providers.filter((provider) => provider.configured);
  if (configured.length === 0) {
    return "unavailable";
  }
  if (configured.every((provider) => provider.status === "healthy")) {
    return "healthy";
  }
  if (configured.some((provider) => provider.status === "invalid-key")) {
    return "invalid-key";
  }
  if (configured.some((provider) => provider.status === "rate-limited")) {
    return "rate-limited";
  }
  if (configured.some((provider) => provider.status === "degraded")) {
    return "degraded";
  }
  return "unavailable";
}

export function recordProviderAttempt(provider: string): void {
  const metric = getMetric(provider);
  metric.lastAttemptAt = nowIso();
}

export function recordProviderRetry(provider: string, attempt: number, maxAttempts: number, error: unknown): void {
  const metric = getMetric(provider);
  metric.retryCount += 1;
  const message = toErrorMessage(error);
  console.warn("[provider-diag] retry", {
    provider,
    attempt,
    maxAttempts,
    error: message,
  });
}

export function recordProviderSuccess(provider: string, latencyMs: number): void {
  const metric = getMetric(provider);
  metric.lastSuccessAt = nowIso();
  metric.lastLatencyMs = latencyMs;
  metric.lastError = undefined;
}

export function recordProviderFailure(provider: string, error: unknown): void {
  const metric = getMetric(provider);
  metric.failureCount += 1;
  metric.lastFailureAt = nowIso();
  metric.lastError = toErrorMessage(error);
}

export function recordProviderRateLimit(provider: string, details: string): void {
  const metric = getMetric(provider);
  metric.rateLimitCount += 1;
  metric.lastFailureAt = nowIso();
  metric.lastError = details;
}

export function recordStaleFeedWarning(reason: string): void {
  console.warn("[provider-diag] stale-feed-warning", {
    reason,
    at: nowIso(),
  });
}

export async function getProviderHealthReport(forceRefresh = false): Promise<ProviderHealthReport> {
  if (!forceRefresh && reportCache && Date.now() - reportCache.at < CACHE_TTL_MS) {
    return reportCache.value;
  }

  const [finnhub, twelveData, alphaVantage] = await Promise.all([
    validateFinnhub(getMetric("Finnhub")),
    validateTwelveData(getMetric("TwelveData")),
    validateAlphaVantage(getMetric("Alpha Vantage")),
  ]);

  const websocket = finnhubSocketManager.getDiagnostics();
  const providers = [finnhub, twelveData, alphaVantage];
  const report: ProviderHealthReport = {
    generatedAt: nowIso(),
    overallStatus: computeOverallStatus(providers),
    websocket,
    providers,
  };

  reportCache = {
    at: Date.now(),
    value: report,
  };

  return report;
}

export function mapProviderValidationToHealth(validation: ProviderValidationResult): ProviderHealthStatus {
  return {
    provider: validation.provider,
    configured: validation.configured,
    ok: validation.status === "healthy",
    status: validation.status,
    latencyMs: validation.latencyMs,
    error: validation.error,
    lastSuccessAt: validation.lastSuccessfulFetch,
    reachable: validation.reachable,
    stale: validation.stale,
    staleMs: validation.staleMs,
    retryCount: validation.retryCount,
    failureCount: validation.failureCount,
    quotaRemaining: validation.quotaRemaining,
    quotaLimit: validation.quotaLimit,
    websocketConnected: validation.websocketConnected,
  };
}

export function startProviderStartupValidation(): void {
  if (startupValidationStarted) {
    return;
  }
  startupValidationStarted = true;

  void (async () => {
    const report = await getProviderHealthReport(true);
    for (const provider of report.providers) {
      if (provider.status !== "healthy") {
        console.error("[provider-diag] startup-warning", {
          provider: provider.provider,
          status: provider.status,
          error: provider.error || null,
          configured: provider.configured,
          keyPresent: provider.keyPresent,
        });
      }
    }
  })().catch((error) => {
    console.error("[provider-diag] startup-validation-failed", error);
  });
}

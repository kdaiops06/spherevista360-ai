"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, RefreshCw, ShieldCheck, Signal, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProviderDiagnosticsReport } from "@/lib/watchlist-ai/types";

const DIAGNOSTICS_POLL_MS = 20_000;

function statusTone(status: string): string {
  if (status === "healthy") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  }
  if (status === "degraded") {
    return "border-amber-400/40 bg-amber-500/15 text-amber-100";
  }
  if (status === "rate-limited") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-100";
  }
  if (status === "invalid-key") {
    return "border-rose-400/40 bg-rose-500/15 text-rose-100";
  }
  return "border-slate-400/30 bg-slate-500/10 text-slate-200";
}

function formatAge(staleMs?: number): string {
  if (!staleMs || !Number.isFinite(staleMs)) {
    return "N/A";
  }
  const totalSeconds = Math.max(0, Math.round(staleMs / 1000));
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs}s`;
}

export function ProviderDiagnosticsPanel() {
  const [report, setReport] = useState<ProviderDiagnosticsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiLatencyMs, setApiLatencyMs] = useState<number | null>(null);
  const inflightRef = useRef<Promise<void> | null>(null);

  const fetchDiagnostics = useCallback(async (force = false) => {
    if (inflightRef.current) {
      return inflightRef.current;
    }

    const request = (async () => {
      setIsLoading(true);
      const startedAt = Date.now();
      try {
        const response = await fetch(`/api/system/provider-health${force ? "?force=1" : ""}`, {
          cache: "no-store",
        });
        setApiLatencyMs(Date.now() - startedAt);
        if (!response.ok) {
          throw new Error(`Diagnostics HTTP ${response.status}`);
        }
        const payload = (await response.json()) as ProviderDiagnosticsReport;
        setReport(payload);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "provider_diagnostics_error");
      } finally {
        setIsLoading(false);
      }
    })();

    inflightRef.current = request;
    try {
      await request;
    } finally {
      inflightRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchDiagnostics().catch(() => undefined);
    const timer = setInterval(() => {
      fetchDiagnostics().catch(() => undefined);
    }, DIAGNOSTICS_POLL_MS);

    return () => clearInterval(timer);
  }, [fetchDiagnostics]);

  const summary = useMemo(() => {
    if (!report) {
      return {
        healthy: 0,
        degraded: 0,
        stale: 0,
      };
    }
    return report.providers.reduce(
      (acc, provider) => {
        if (provider.status === "healthy") {
          acc.healthy += 1;
        }
        if (provider.status !== "healthy") {
          acc.degraded += 1;
        }
        if (provider.stale) {
          acc.stale += 1;
        }
        return acc;
      },
      { healthy: 0, degraded: 0, stale: 0 }
    );
  }, [report]);

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
            Provider Health + Diagnostics
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Production observability for API reachability, quota pressure, websocket state, and stale-feed detection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("border", statusTone(report?.overallStatus || "unavailable"))}>
            {(report?.overallStatus || "unavailable").toUpperCase()}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => fetchDiagnostics(true)}>
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh Diagnostics
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3">
          <p className="text-xs text-cyan-100">Health API Latency</p>
          <p className="mt-1 text-xl font-semibold text-white">{apiLatencyMs != null ? `${apiLatencyMs}ms` : "N/A"}</p>
        </div>
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-100">Healthy Providers</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.healthy}</p>
        </div>
        <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 p-3">
          <p className="text-xs text-amber-100">Non-Healthy Providers</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.degraded}</p>
        </div>
        <div className="rounded-xl border border-orange-300/25 bg-orange-500/10 p-3">
          <p className="text-xs text-orange-100">Stale Providers</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.stale}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Signal className="h-4 w-4 text-cyan-300" />
          Websocket Transport
        </h3>
        <div className="mt-2 grid gap-2 text-xs text-slate-300 md:grid-cols-4">
          <p>
            Status:{" "}
            <span className={cn("font-semibold", report?.websocket.connected ? "text-emerald-300" : "text-rose-300")}>
              {report?.websocket.connected ? "connected" : "disconnected"}
            </span>
          </p>
          <p>Reconnect attempts: {report?.websocket.reconnectAttempts ?? 0}</p>
          <p>Subscribed symbols: {report?.websocket.subscribedSymbols ?? 0}</p>
          <p>Last message: {report?.websocket.lastMessageAt ? new Date(report.websocket.lastMessageAt).toLocaleTimeString() : "N/A"}</p>
        </div>
        {report?.websocket.lastError ? (
          <p className="mt-2 text-xs text-orange-200">Last websocket error: {report.websocket.lastError}</p>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs text-rose-100">
          Diagnostics fetch failed: {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(report?.providers || []).map((provider) => (
          <article key={provider.provider} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">{provider.provider}</h3>
              <Badge className={cn("border", statusTone(provider.status))}>{provider.status.toUpperCase()}</Badge>
            </div>

            <div className="mt-2 space-y-1 text-xs text-slate-300">
              <p>
                Key: <span className={provider.keyPresent ? "text-emerald-300" : "text-rose-300"}>{provider.keyPresent ? "present" : "missing"}</span>
              </p>
              <p>
                Reachable:{" "}
                <span className={provider.reachable ? "text-emerald-300" : "text-rose-300"}>
                  {provider.reachable ? "yes" : "no"}
                </span>
              </p>
              <p>API latency: {provider.latencyMs != null ? `${provider.latencyMs}ms` : "N/A"}</p>
              <p>
                Quota: {provider.quotaRemaining != null ? provider.quotaRemaining : "N/A"}
                {provider.quotaLimit != null ? ` / ${provider.quotaLimit}` : ""}
              </p>
              <p>
                Last success: {provider.lastSuccessfulFetch ? new Date(provider.lastSuccessfulFetch).toLocaleTimeString() : "never"}
              </p>
              <p>
                Stale: <span className={provider.stale ? "text-orange-300" : "text-emerald-300"}>{provider.stale ? `yes (${formatAge(provider.staleMs)})` : "no"}</span>
              </p>
              <p>Retries: {provider.retryCount}</p>
              <p>Failures: {provider.failureCount}</p>
              {provider.websocketConnected != null ? (
                <p>
                  WS probe:{" "}
                  <span className={provider.websocketConnected ? "text-emerald-300" : "text-orange-300"}>
                    {provider.websocketConnected ? "connected" : "failed"}
                  </span>
                </p>
              ) : null}
            </div>

            {provider.error ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-md border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-100">
                <WifiOff className="h-3.5 w-3.5" />
                {provider.error}
              </p>
            ) : null}

            {provider.messages.length > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-100">
                <AlertTriangle className="h-3.5 w-3.5" />
                {provider.messages[0]}
              </p>
            ) : null}

            <p className="mt-2 text-[11px] text-slate-400">
              Checked at {new Date(provider.checkedAt).toLocaleTimeString()} <Activity className="ml-1 inline h-3 w-3" />
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

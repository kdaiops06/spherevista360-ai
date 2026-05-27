import { NextRequest, NextResponse } from "next/server";
import { getWatchlistSnapshot } from "@/lib/watchlist-ai/service";
import type { WatchlistSnapshot, WatchlistTimeframe } from "@/lib/watchlist-ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validTimeframes: WatchlistTimeframe[] = ["1D", "1W", "1M", "3M", "1Y"];
const REQUEST_LOG_SAMPLE_RATE = 25;
const MIN_CLIENT_REQUEST_GAP_MS = 10_000;
const MIN_LEGACY_REQUEST_GAP_MS = 30_000;
const REQUIRE_CLIENT_ID = process.env.WATCHLIST_AI_REQUIRE_CLIENT_ID === "1";
let watchlistRequestCount = 0;
const recentClientSnapshots = new Map<string, { at: number; snapshot: WatchlistSnapshot }>();

function parseTimeframe(value: string | null): WatchlistTimeframe {
  if (!value) {
    return "1D";
  }
  return validTimeframes.includes(value as WatchlistTimeframe) ? (value as WatchlistTimeframe) : "1D";
}

function parseSymbols(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const symbols = value
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  return symbols.length > 0 ? symbols : undefined;
}

function getClientAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function GET(request: NextRequest) {
  try {
    watchlistRequestCount += 1;
    const now = Date.now();
    const timeframe = parseTimeframe(request.nextUrl.searchParams.get("timeframe"));
    const symbols = parseSymbols(request.nextUrl.searchParams.get("symbols"));
    const clientId = request.nextUrl.searchParams.get("clientId") || "";
    const forceRefresh = request.nextUrl.searchParams.get("force") === "1";
    const ip = getClientAddress(request);
    const throttleKey = `${ip}|${timeframe}|${(symbols || []).join(",")}|${clientId || "legacy"}`;
    const minGapMs = clientId ? MIN_CLIENT_REQUEST_GAP_MS : MIN_LEGACY_REQUEST_GAP_MS;

    if (watchlistRequestCount % REQUEST_LOG_SAMPLE_RATE === 0) {
      console.warn("[watchlist-ai] request-sample", {
        count: watchlistRequestCount,
        timeframe,
        symbols: symbols?.length ?? 0,
        clientId,
        forceRefresh,
        ip,
        referer: request.headers.get("referer") ?? "",
        userAgent: request.headers.get("user-agent") ?? "",
        secFetchDest: request.headers.get("sec-fetch-dest") ?? "",
        secFetchMode: request.headers.get("sec-fetch-mode") ?? "",
      });
    }

    if (REQUIRE_CLIENT_ID && !clientId && !forceRefresh) {
      return NextResponse.json(
        {
          message: "Client refresh required. Missing clientId.",
        },
        {
          status: 426,
          headers: {
            "Cache-Control": "no-store",
            "X-Watchlist-Requires-Refresh": "1",
          },
        }
      );
    }

    if (!forceRefresh) {
      const recent = recentClientSnapshots.get(throttleKey);
      if (recent && now - recent.at < minGapMs) {
        return NextResponse.json(recent.snapshot, {
          headers: {
            "Cache-Control": "no-store",
            "X-Watchlist-Throttled": "1",
            "X-Watchlist-Throttle-Ms": String(minGapMs),
          },
        });
      }
    }

    const snapshot = await getWatchlistSnapshot({
      timeframe,
      symbols,
      forceRefresh,
    });

    recentClientSnapshots.set(throttleKey, { at: Date.now(), snapshot });

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[watchlist-ai] API failed", error);
    return NextResponse.json(
      {
        error: "Unable to load watchlist intelligence snapshot",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getWatchlistSnapshot } from "@/lib/watchlist-ai/service";
import type { WatchlistTimeframe } from "@/lib/watchlist-ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validTimeframes: WatchlistTimeframe[] = ["1D", "1W", "1M", "3M", "1Y"];

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

export async function GET(request: NextRequest) {
  try {
    const timeframe = parseTimeframe(request.nextUrl.searchParams.get("timeframe"));
    const symbols = parseSymbols(request.nextUrl.searchParams.get("symbols"));
    const forceRefresh = request.nextUrl.searchParams.get("force") === "1";

    const snapshot = await getWatchlistSnapshot({
      timeframe,
      symbols,
      forceRefresh,
    });

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

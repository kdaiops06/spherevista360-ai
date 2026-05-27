import { NextRequest, NextResponse } from "next/server";
import { getStockComparisonSnapshot } from "@/lib/stock-compare/service";
import type { ComparisonHorizon } from "@/lib/stock-compare/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const horizons: ComparisonHorizon[] = ["1W", "1M", "3M", "6M", "1Y", "3Y", "LONG"];

function parseHorizon(value: string | null): ComparisonHorizon {
  if (!value) {
    return "1Y";
  }
  return horizons.includes(value as ComparisonHorizon) ? (value as ComparisonHorizon) : "1Y";
}

function parseSymbols(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const symbols = value
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 6);
  return symbols.length >= 2 ? symbols : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const horizon = parseHorizon(request.nextUrl.searchParams.get("horizon"));
    const symbols = parseSymbols(request.nextUrl.searchParams.get("symbols"));
    const forceRefresh = request.nextUrl.searchParams.get("force") === "1";

    const snapshot = await getStockComparisonSnapshot({
      symbols,
      horizon,
      forceRefresh,
    });

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[stock-compare] failed", error);
    return NextResponse.json({ error: "Unable to load stock comparison snapshot" }, { status: 500 });
  }
}

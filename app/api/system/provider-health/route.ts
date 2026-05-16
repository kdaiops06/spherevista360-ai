import { NextResponse } from "next/server";
import { getProviderHealthReport } from "@/lib/watchlist-ai/provider-diagnostics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("force") === "1";
    const report = await getProviderHealthReport(forceRefresh);

    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[provider-diag] provider-health route failed", error);
    return NextResponse.json(
      {
        error: "provider_health_unavailable",
      },
      { status: 500 }
    );
  }
}

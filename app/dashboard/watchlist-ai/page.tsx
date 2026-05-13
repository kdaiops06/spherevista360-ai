import type { Metadata } from "next";
import { WatchlistDashboardClient } from "@/components/watchlist-ai/WatchlistDashboardClient";
import { getWatchlistSnapshot } from "@/lib/watchlist-ai/service";
import { getMarketData, getPredictions } from "@/lib/fetch-live-data";
import { getRecessionSignal } from "@/lib/financial-intelligence";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Stock Watchlist Intelligence Dashboard",
  description:
    "Premium cinematic stock watchlist intelligence with realtime alerts, AI momentum scoring, volatility analytics, and institutional-grade market insights.",
  openGraph: {
    title: "SphereVista360 Watchlist AI Dashboard",
    description:
      "Realtime AI stock intelligence dashboard with premium watchlist analytics, alerts, and market pulse.",
    type: "website",
  },
};

export default async function WatchlistAIDashboardPage() {
  const [snapshot, market, predictions, recessionSignal] = await Promise.all([
    getWatchlistSnapshot({ timeframe: "1D" }),
    getMarketData(),
    getPredictions(),
    getRecessionSignal(),
  ]);

  return (
    <WatchlistDashboardClient
      initialSnapshot={snapshot}
      marketData={market.data}
      predictions={predictions.data}
      recessionSignal={recessionSignal}
    />
  );
}

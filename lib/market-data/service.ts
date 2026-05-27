import { MarketCache } from "@/lib/cache/market-cache";
import { fetchProviderBatch } from "@/lib/providers";
import type { WatchlistTimeframe } from "@/lib/watchlist-ai/types";
import type { MarketDataSnapshot } from "@/lib/market-data/types";

const marketCache = new MarketCache<MarketDataSnapshot>(10_000);

function cacheKey(symbols: string[], timeframe: WatchlistTimeframe): string {
  return `${timeframe}:${symbols.join(",")}`;
}

export async function getMarketDataSnapshot(params: {
  symbols: string[];
  timeframe: WatchlistTimeframe;
  forceRefresh?: boolean;
}): Promise<MarketDataSnapshot> {
  const key = cacheKey(params.symbols, params.timeframe);

  if (!params.forceRefresh) {
    const cached = marketCache.get(key);
    if (cached) {
      return cached.value;
    }
  }

  const result = await fetchProviderBatch({
    symbols: params.symbols,
    timeframe: params.timeframe,
  });

  const snapshot: MarketDataSnapshot = {
    quotes: result.quotes,
    source: result.source,
    isLive: result.isLive,
    stale: !result.isLive,
    staleReason: result.staleReason,
    providerHealth: result.providerHealth,
    updatedAt: new Date().toISOString(),
  };

  marketCache.set(key, snapshot);
  return snapshot;
}

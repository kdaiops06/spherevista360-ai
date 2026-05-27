import type { ProviderHealthStatus, RawProviderQuote, WatchlistTimeframe } from "@/lib/watchlist-ai/types";

export interface ProviderFetchParams {
  symbols: string[];
  timeframe: WatchlistTimeframe;
}

export interface ProviderBatchResult {
  quotes: RawProviderQuote[];
  source: string;
  isLive: boolean;
  staleReason?: string;
  providerHealth: ProviderHealthStatus[];
}

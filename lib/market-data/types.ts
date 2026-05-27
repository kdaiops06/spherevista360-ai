import type { ProviderHealthStatus, RawProviderQuote } from "@/lib/watchlist-ai/types";

export interface MarketDataSnapshot {
  quotes: RawProviderQuote[];
  source: string;
  isLive: boolean;
  stale: boolean;
  staleReason?: string;
  providerHealth: ProviderHealthStatus[];
  updatedAt: string;
}

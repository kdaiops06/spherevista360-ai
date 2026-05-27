import { WATCHLIST_PROVIDER_ORDER } from "@/lib/watchlist-ai/providers";
import type { ProviderBatchResult } from "@/lib/providers/types";
import type { ProviderHealthStatus, RawProviderQuote, WatchlistTimeframe } from "@/lib/watchlist-ai/types";

export async function fetchProviderBatch(params: { symbols: string[]; timeframe: WatchlistTimeframe }): Promise<ProviderBatchResult> {
  const providerHealth: ProviderHealthStatus[] = WATCHLIST_PROVIDER_ORDER.map((provider) => ({
    provider: provider.name,
    configured: provider.isConfigured(),
    ok: false,
  }));

  for (const provider of WATCHLIST_PROVIDER_ORDER) {
    const status = providerHealth.find((entry) => entry.provider === provider.name);
    if (!provider.isConfigured()) {
      if (status) {
        status.error = "not_configured";
      }
      continue;
    }

    const start = Date.now();
    try {
      const quotes: RawProviderQuote[] = await provider.fetchQuotes({
        symbols: params.symbols,
        timeframe: params.timeframe,
      });

      if (quotes.length > 0) {
        if (status) {
          status.ok = true;
          status.lastSuccessAt = new Date().toISOString();
          status.latencyMs = Date.now() - start;
        }
        return {
          quotes,
          source: provider.name,
          isLive: true,
          providerHealth,
        };
      }

      if (status) {
        status.error = "empty_response";
      }
    } catch (error) {
      if (status) {
        status.error = error instanceof Error ? error.message : "provider_error";
      }
    }
  }

  return {
    quotes: [],
    source: "No provider available",
    isLive: false,
    staleReason: "No realtime provider returned valid stock data.",
    providerHealth,
  };
}

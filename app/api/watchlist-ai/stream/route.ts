import { getWatchlistSnapshot } from "@/lib/watchlist-ai/service";
import type { WatchlistTimeframe } from "@/lib/watchlist-ai/types";
import { finnhubSocketManager } from "@/lib/websocket/finnhub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
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

function toSsePayload(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const timeframe = parseTimeframe(url.searchParams.get("timeframe"));
  const symbols = parseSymbols(url.searchParams.get("symbols"));
  const activeSymbols = symbols && symbols.length > 0 ? symbols : ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META"];

  let intervalId: NodeJS.Timeout | undefined;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(toSsePayload("connected", { timeframe, symbols: symbols || [] }));
      finnhubSocketManager.subscribe(activeSymbols);

      const pushSnapshot = async () => {
        try {
          const snapshot = await getWatchlistSnapshot({
            timeframe,
            symbols,
            forceRefresh: true,
          });
          controller.enqueue(toSsePayload("snapshot", snapshot));
        } catch (error) {
          controller.enqueue(
            toSsePayload("error", {
              message: "watchlist_stream_error",
            })
          );
          console.error("[watchlist-ai] stream push failed", error);
        }
      };

      await pushSnapshot();
      intervalId = setInterval(pushSnapshot, 10_000);
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId);
      }
      finnhubSocketManager.unsubscribe(activeSymbols);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

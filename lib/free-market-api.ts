import type { MarketData, NewsItem } from "@/types";

// ─── Free Market Data via Yahoo Finance (no API key needed) ──────
// Uses Yahoo Finance v8 chart API — publicly accessible, no signup required.
// Returns delayed/end-of-day quotes for major ETFs and indices.

const YAHOO_BASE = "https://query2.finance.yahoo.com/v8/finance/chart";

interface YahooChartResult {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        shortName?: string;
        regularMarketPrice: number;
        previousClose: number;
        regularMarketTime: number;
      };
    }> | null;
    error: unknown;
  };
}

/**
 * Fetch current price for a single symbol from Yahoo Finance.
 * No API key required.
 */
async function fetchYahooQuote(symbol: string): Promise<MarketData | null> {
  try {
    const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=1d&interval=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SphereVista360/1.0)",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data: YahooChartResult = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const { meta } = result;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose;

    if (typeof price !== "number" || Number.isNaN(price)) {
      return null;
    }

    const hasValidPreviousClose = typeof prevClose === "number" && prevClose > 0;
    const change = hasValidPreviousClose ? price - prevClose : 0;
    const changePercent = hasValidPreviousClose ? (change / prevClose) * 100 : 0;

    return {
      symbol: meta.symbol,
      name: meta.shortName || symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      lastUpdated: new Date(meta.regularMarketTime * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch market data for multiple symbols from Yahoo Finance.
 * Returns all successfully fetched quotes.
 */
export async function fetchFreeMarketData(
  symbols: string[]
): Promise<{ data: MarketData[]; source: string; lastUpdated: string } | null> {
  const results = await Promise.allSettled(symbols.map(fetchYahooQuote));
  const quotes = results
    .filter(
      (r): r is PromiseFulfilledResult<MarketData | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((q): q is MarketData => q !== null);

  if (quotes.length === 0) return null;

  return {
    data: quotes,
    source: "Yahoo Finance",
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Free News via Google News RSS (no API key needed) ───────────
// Parses Google News RSS feed for finance/markets headlines.

/**
 * Fetch latest finance news from Google News RSS feed.
 * No API key required.
 */
export async function fetchFreeNews(): Promise<{
  data: NewsItem[];
  source: string;
  lastUpdated: string;
} | null> {
  try {
    const url =
      "https://news.google.com/rss/search?q=finance+stock+market+economy&hl=en-US&gl=US&ceid=US:en";
    console.log('[fetchFreeNews] Fetching:', url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SphereVista360/1.0)",
      },
      next: { revalidate: 300 }, // 5 minutes, force revalidate for news freshness
    });

    if (!res.ok) {
      console.error('[fetchFreeNews] Response not ok:', res.status, res.statusText);
      return null;
    }

    const xml = await res.text();
    console.log('[fetchFreeNews] XML length:', xml.length);

    // Simple XML parsing with regex — extract <item> blocks
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/);
      const link = block.match(/<link>(.*?)<\/link>|<link\/>\s*(https?:\/\/[^\s<]+)/);
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/);
      const source = block.match(/<source[^>]*>(.*?)<\/source>/);

      const titleText = title?.[1] || title?.[2];
      const linkText = link?.[1] || link?.[2];

      if (titleText && linkText) {
        items.push({
          title: decodeHTMLEntities(titleText),
          description: "",
          url: linkText,
          source: source?.[1] || "Google News",
          publishedAt: pubDate?.[1]
            ? new Date(pubDate[1]).toISOString()
            : new Date().toISOString(),
          category: "finance",
        });
      }
    }

    if (items.length === 0) {
      console.warn('[fetchFreeNews] No news items parsed from RSS.');
      return null;
    }

    console.log('[fetchFreeNews] Parsed news items:', items.length);
    return {
      data: items,
      source: "Google News",
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

import type {
  ProviderClient,
  ProviderFetchContext,
  RawProviderQuote,
  WatchlistTimeframe,
} from "@/lib/watchlist-ai/types";

const REQUEST_TIMEOUT_MS = Number(process.env.WATCHLIST_AI_REQUEST_TIMEOUT_MS || 7000);
const REQUEST_RETRIES = Number(process.env.WATCHLIST_AI_RETRY_ATTEMPTS || 2);
const MAX_REQUESTS_PER_MINUTE = Number(process.env.WATCHLIST_AI_MAX_REQUESTS_PER_MINUTE || 80);

const requestLog = new Map<string, number[]>();

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSeries(series: number[] | undefined, fallbackPrice: number): number[] {
  if (!series || series.length < 2) {
    return [
      fallbackPrice * 0.98,
      fallbackPrice * 0.985,
      fallbackPrice * 0.99,
      fallbackPrice * 0.995,
      fallbackPrice,
    ].map((n) => Number(n.toFixed(2)));
  }
  return series.slice(-30).map((point) => Number(point.toFixed(2)));
}

function trackProviderRequest(providerName: string) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = requestLog.get(providerName) || [];
  const active = timestamps.filter((timestamp) => timestamp >= windowStart);

  if (active.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error(`${providerName} request budget exhausted`);
  }

  active.push(now);
  requestLog.set(providerName, active);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry<T>(providerName: string, url: string): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt += 1) {
    try {
      trackProviderRequest(providerName);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "SphereVista360-Watchlist/1.0",
        },
        cache: "no-store",
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`${providerName} HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < REQUEST_RETRIES) {
        await sleep(250 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${providerName} request failed`);
}

function timeframeToDays(timeframe: WatchlistTimeframe): number {
  switch (timeframe) {
    case "1D":
      return 2;
    case "1W":
      return 8;
    case "1M":
      return 32;
    case "3M":
      return 95;
    case "1Y":
      return 370;
    default:
      return 32;
  }
}

function sanitizeQuote(quote: RawProviderQuote): RawProviderQuote | null {
  if (!quote || !quote.ticker || Number.isNaN(quote.price) || quote.price <= 0) {
    return null;
  }

  const dayHigh = quote.dayHigh > 0 ? quote.dayHigh : quote.price;
  const dayLow = quote.dayLow > 0 ? quote.dayLow : quote.price;

  return {
    ...quote,
    ticker: quote.ticker.toUpperCase(),
    dayHigh: Math.max(dayHigh, dayLow),
    dayLow: Math.min(dayHigh, dayLow),
    volume: Math.max(0, quote.volume || 0),
    changePercent: Number.isFinite(quote.changePercent) ? quote.changePercent : 0,
    series: normalizeSeries(quote.series, quote.price),
  };
}

const finnhubClient: ProviderClient = {
  name: "Finnhub",
  isConfigured() {
    return Boolean(process.env.FINNHUB_API_KEY);
  },
  async fetchQuotes(context: ProviderFetchContext) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return [];
    }

    const now = Math.floor(Date.now() / 1000);
    const from = now - timeframeToDays(context.timeframe) * 86_400;

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
        const candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${apiKey}`;

        const [quoteData, candleData] = await Promise.all([
          fetchJsonWithRetry<{ c: number; h: number; l: number; dp: number; v?: number }>("Finnhub", quoteUrl),
          fetchJsonWithRetry<{ c?: number[]; v?: number[] }>("Finnhub", candleUrl),
        ]);

        const series = Array.isArray(candleData.c) ? candleData.c : undefined;
        const volumeSeries = Array.isArray(candleData.v) ? candleData.v : undefined;

        return sanitizeQuote({
          ticker: symbol,
          price: Number(quoteData.c || 0),
          dayHigh: Number(quoteData.h || quoteData.c || 0),
          dayLow: Number(quoteData.l || quoteData.c || 0),
          changePercent: Number(quoteData.dp || 0),
          volume: Number(volumeSeries?.at(-1) || quoteData.v || 0),
          series,
        });
      })
    );

    return quotes.filter((quote): quote is RawProviderQuote => quote !== null);
  },
};

const twelveDataClient: ProviderClient = {
  name: "TwelveData",
  isConfigured() {
    return Boolean(process.env.TWELVEDATA_API_KEY);
  },
  async fetchQuotes(context: ProviderFetchContext) {
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (!apiKey) {
      return [];
    }

    const outputSize = clamp(timeframeToDays(context.timeframe), 5, 80);

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const quoteUrl = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
        const seriesUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=${outputSize}&apikey=${apiKey}`;

        const [quoteData, seriesData] = await Promise.all([
          fetchJsonWithRetry<{
            close?: string;
            percent_change?: string;
            high?: string;
            low?: string;
            volume?: string;
            market_cap?: string;
            name?: string;
          }>("TwelveData", quoteUrl),
          fetchJsonWithRetry<{ values?: Array<{ close?: string }> }>("TwelveData", seriesUrl),
        ]);

        const series = (seriesData.values || [])
          .map((entry) => Number(entry.close || 0))
          .filter((value) => value > 0)
          .reverse();

        return sanitizeQuote({
          ticker: symbol,
          price: Number(quoteData.close || 0),
          dayHigh: Number(quoteData.high || quoteData.close || 0),
          dayLow: Number(quoteData.low || quoteData.close || 0),
          changePercent: Number(quoteData.percent_change || 0),
          volume: Number(quoteData.volume || 0),
          marketCap: quoteData.market_cap ? Number(quoteData.market_cap) : null,
          companyName: quoteData.name,
          series,
        });
      })
    );

    return quotes.filter((quote): quote is RawProviderQuote => quote !== null);
  },
};

const polygonClient: ProviderClient = {
  name: "Polygon",
  isConfigured() {
    return Boolean(process.env.POLYGON_API_KEY);
  },
  async fetchQuotes(context: ProviderFetchContext) {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      return [];
    }

    const to = new Date();
    const from = new Date(to.getTime() - timeframeToDays(context.timeframe) * 86_400_000);
    const fromDate = from.toISOString().slice(0, 10);
    const toDate = to.toISOString().slice(0, 10);

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const aggsUrl = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=500&apiKey=${apiKey}`;
        const aggsData = await fetchJsonWithRetry<{
          results?: Array<{ c: number; h: number; l: number; v: number }>;
        }>("Polygon", aggsUrl);

        const candles = aggsData.results || [];
        if (candles.length === 0) {
          return null;
        }

        const latest = candles[candles.length - 1];
        const previous = candles[candles.length - 2] || latest;
        const changePercent = previous.c > 0 ? ((latest.c - previous.c) / previous.c) * 100 : 0;

        return sanitizeQuote({
          ticker: symbol,
          price: Number(latest.c || 0),
          dayHigh: Number(latest.h || latest.c || 0),
          dayLow: Number(latest.l || latest.c || 0),
          changePercent,
          volume: Number(latest.v || 0),
          series: candles.map((candle) => Number(candle.c || 0)),
        });
      })
    );

    return quotes.filter((quote): quote is RawProviderQuote => quote !== null);
  },
};

const alphaVantageClient: ProviderClient = {
  name: "Alpha Vantage",
  isConfigured() {
    return Boolean(process.env.ALPHA_VANTAGE_API_KEY);
  },
  async fetchQuotes(context: ProviderFetchContext) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return [];
    }

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
        const data = await fetchJsonWithRetry<{
          "Global Quote"?: {
            "05. price"?: string;
            "10. change percent"?: string;
            "03. high"?: string;
            "04. low"?: string;
            "06. volume"?: string;
          };
        }>("AlphaVantage", quoteUrl);

        const quote = data["Global Quote"];
        if (!quote) {
          return null;
        }

        const rawChangePercent = Number((quote["10. change percent"] || "0").replace("%", ""));
        const price = Number(quote["05. price"] || 0);

        return sanitizeQuote({
          ticker: symbol,
          price,
          dayHigh: Number(quote["03. high"] || price || 0),
          dayLow: Number(quote["04. low"] || price || 0),
          changePercent: Number.isFinite(rawChangePercent) ? rawChangePercent : 0,
          volume: Number(quote["06. volume"] || 0),
        });
      })
    );

    return quotes.filter((quote): quote is RawProviderQuote => quote !== null);
  },
};

export const WATCHLIST_PROVIDER_ORDER: ProviderClient[] = [
  finnhubClient,
  twelveDataClient,
  polygonClient,
  alphaVantageClient,
];

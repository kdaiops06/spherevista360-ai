import type {
  CardTimeframe,
  ProviderClient,
  ProviderFetchContext,
  RawProviderQuote,
  StockFundamentals,
} from "@/lib/watchlist-ai/types";

const REQUEST_TIMEOUT_MS = Number(process.env.WATCHLIST_AI_REQUEST_TIMEOUT_MS || 7000);
const REQUEST_RETRIES = Number(process.env.WATCHLIST_AI_RETRY_ATTEMPTS || 2);
const MAX_REQUESTS_PER_MINUTE = Number(process.env.WATCHLIST_AI_MAX_REQUESTS_PER_MINUTE || 80);

const requestLog = new Map<string, number[]>();

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function takeLast(series: number[], count: number): number[] {
  if (series.length <= count) {
    return series;
  }
  return series.slice(series.length - count);
}

function normalizeSeries(series: number[] | undefined, fallbackPrice: number): number[] {
  const safe = (series || []).filter((point) => Number.isFinite(point) && point > 0);
  if (safe.length < 2) {
    return [
      fallbackPrice * 0.98,
      fallbackPrice * 0.985,
      fallbackPrice * 0.99,
      fallbackPrice * 0.995,
      fallbackPrice,
    ].map((n) => Number(n.toFixed(2)));
  }
  return takeLast(safe, 78).map((point) => Number(point.toFixed(2)));
}

function buildTimeframeSeries(args: { intraday?: number[]; daily?: number[]; fallbackPrice: number }): Partial<Record<CardTimeframe, number[]>> {
  const { intraday, daily, fallbackPrice } = args;
  const safeDaily = (daily || []).filter((v) => Number.isFinite(v) && v > 0);
  const safeIntraday = (intraday || []).filter((v) => Number.isFinite(v) && v > 0);

  const fallback = normalizeSeries(undefined, fallbackPrice);

  const oneDay = safeIntraday.length > 8 ? takeLast(safeIntraday, 78) : takeLast(safeDaily, 22);
  const oneWeek = takeLast(safeDaily, 7);
  const oneMonth = takeLast(safeDaily, 22);
  const threeMonth = takeLast(safeDaily, 66);

  return {
    "1D": oneDay.length >= 2 ? oneDay : fallback,
    "1W": oneWeek.length >= 2 ? oneWeek : fallback,
    "1M": oneMonth.length >= 2 ? oneMonth : fallback,
    "3M": threeMonth.length >= 2 ? threeMonth : fallback,
  };
}

function normalizeFundamentals(input?: Partial<StockFundamentals>): Partial<StockFundamentals> {
  if (!input) {
    return {};
  }
  const asNumber = (value: unknown): number | null => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  return {
    peRatio: asNumber(input.peRatio),
    pbRatio: asNumber(input.pbRatio),
    debtToEquity: asNumber(input.debtToEquity),
    eps: asNumber(input.eps),
    revenueGrowth: asNumber(input.revenueGrowth),
    operatingMargin: asNumber(input.operatingMargin),
    roe: asNumber(input.roe),
    dividendYield: asNumber(input.dividendYield),
    beta: asNumber(input.beta),
  };
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
          "User-Agent": "SphereVista360-Watchlist/2.0",
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
        await sleep(220 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${providerName} request failed`);
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
    fundamentals: normalizeFundamentals(quote.fundamentals),
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
    const fromDaily = now - 120 * 86_400;
    const fromIntraday = now - 2 * 86_400;

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
        const dailyCandleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${fromDaily}&to=${now}&token=${apiKey}`;
        const intradayCandleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=5&from=${fromIntraday}&to=${now}&token=${apiKey}`;
        const metricUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`;
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

        const [quoteData, dailyCandleData, intradayCandleData, metricData, profileData] = await Promise.all([
          fetchJsonWithRetry<{ c: number; h: number; l: number; dp: number; v?: number }>("Finnhub", quoteUrl),
          fetchJsonWithRetry<{ c?: number[]; v?: number[] }>("Finnhub", dailyCandleUrl),
          fetchJsonWithRetry<{ c?: number[] }>("Finnhub", intradayCandleUrl),
          fetchJsonWithRetry<{ metric?: Record<string, number> }>("Finnhub", metricUrl),
          fetchJsonWithRetry<{ name?: string; finnhubIndustry?: string; marketCapitalization?: number }>("Finnhub", profileUrl),
        ]);

        const dailySeries = Array.isArray(dailyCandleData.c) ? dailyCandleData.c : undefined;
        const intradaySeries = Array.isArray(intradayCandleData.c) ? intradayCandleData.c : undefined;
        const volumeSeries = Array.isArray(dailyCandleData.v) ? dailyCandleData.v : undefined;
        const metric = metricData.metric || {};

        const timeframeSeries = buildTimeframeSeries({
          intraday: intradaySeries,
          daily: dailySeries,
          fallbackPrice: Number(quoteData.c || 0),
        });

        return sanitizeQuote({
          ticker: symbol,
          price: Number(quoteData.c || 0),
          dayHigh: Number(quoteData.h || quoteData.c || 0),
          dayLow: Number(quoteData.l || quoteData.c || 0),
          changePercent: Number(quoteData.dp || 0),
          volume: Number(volumeSeries?.at(-1) || quoteData.v || 0),
          series: timeframeSeries["1D"],
          timeframeSeries,
          marketCap: Number.isFinite(profileData.marketCapitalization) ? Number(profileData.marketCapitalization) * 1_000_000 : null,
          companyName: profileData.name,
          sector: profileData.finnhubIndustry,
          fundamentals: {
            peRatio: metric.peNormalizedAnnual || metric.peTTM || null,
            pbRatio: metric.pbQuarterly || null,
            debtToEquity: metric.totalDebtToEquityQuarterly || null,
            eps: metric.epsNormalizedAnnual || metric.epsInclExtraItemsTTM || null,
            revenueGrowth: metric.revenueGrowthTTMYoy || null,
            operatingMargin: metric.operatingMarginTTM || null,
            roe: metric.roeTTM || null,
            dividendYield: metric.dividendYieldIndicatedAnnual || null,
            beta: metric.beta || null,
          },
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

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const quoteUrl = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
        const dailySeriesUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=90&apikey=${apiKey}`;
        const intradaySeriesUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=5min&outputsize=78&apikey=${apiKey}`;

        const [quoteData, dailySeriesData, intradaySeriesData] = await Promise.all([
          fetchJsonWithRetry<{
            close?: string;
            percent_change?: string;
            high?: string;
            low?: string;
            volume?: string;
            market_cap?: string;
            name?: string;
          }>("TwelveData", quoteUrl),
          fetchJsonWithRetry<{ values?: Array<{ close?: string }> }>("TwelveData", dailySeriesUrl),
          fetchJsonWithRetry<{ values?: Array<{ close?: string }> }>("TwelveData", intradaySeriesUrl),
        ]);

        const dailySeries = (dailySeriesData.values || []).map((entry) => Number(entry.close || 0)).filter((v) => v > 0).reverse();
        const intradaySeries = (intradaySeriesData.values || []).map((entry) => Number(entry.close || 0)).filter((v) => v > 0).reverse();

        const timeframeSeries = buildTimeframeSeries({
          intraday: intradaySeries,
          daily: dailySeries,
          fallbackPrice: Number(quoteData.close || 0),
        });

        return sanitizeQuote({
          ticker: symbol,
          price: Number(quoteData.close || 0),
          dayHigh: Number(quoteData.high || quoteData.close || 0),
          dayLow: Number(quoteData.low || quoteData.close || 0),
          changePercent: Number(quoteData.percent_change || 0),
          volume: Number(quoteData.volume || 0),
          marketCap: quoteData.market_cap ? Number(quoteData.market_cap) : null,
          companyName: quoteData.name,
          series: timeframeSeries["1D"],
          timeframeSeries,
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
    const from = new Date(to.getTime() - 120 * 86_400_000);
    const intradayFrom = new Date(to.getTime() - 2 * 86_400_000);
    const fromDate = from.toISOString().slice(0, 10);
    const toDate = to.toISOString().slice(0, 10);
    const intradayFromDate = intradayFrom.toISOString().slice(0, 10);

    const quotes = await Promise.all(
      context.symbols.map(async (symbol): Promise<RawProviderQuote | null> => {
        const aggsUrl = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=500&apiKey=${apiKey}`;
        const intradayAggsUrl = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/5/minute/${intradayFromDate}/${toDate}?adjusted=true&sort=asc&limit=1000&apiKey=${apiKey}`;

        const [aggsData, intradayData] = await Promise.all([
          fetchJsonWithRetry<{ results?: Array<{ c: number; h: number; l: number; v: number }> }>("Polygon", aggsUrl),
          fetchJsonWithRetry<{ results?: Array<{ c: number }> }>("Polygon", intradayAggsUrl),
        ]);

        const candles = aggsData.results || [];
        if (candles.length === 0) {
          return null;
        }

        const latest = candles[candles.length - 1];
        const previous = candles[candles.length - 2] || latest;
        const changePercent = previous.c > 0 ? ((latest.c - previous.c) / previous.c) * 100 : 0;

        const timeframeSeries = buildTimeframeSeries({
          intraday: (intradayData.results || []).map((entry) => Number(entry.c || 0)).filter((v) => v > 0),
          daily: candles.map((entry) => Number(entry.c || 0)).filter((v) => v > 0),
          fallbackPrice: Number(latest.c || 0),
        });

        return sanitizeQuote({
          ticker: symbol,
          price: Number(latest.c || 0),
          dayHigh: Number(latest.h || latest.c || 0),
          dayLow: Number(latest.l || latest.c || 0),
          changePercent,
          volume: Number(latest.v || 0),
          series: timeframeSeries["1D"],
          timeframeSeries,
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
        const seriesUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`;

        const [quoteData, seriesData] = await Promise.all([
          fetchJsonWithRetry<{
            "Global Quote"?: {
              "05. price"?: string;
              "10. change percent"?: string;
              "03. high"?: string;
              "04. low"?: string;
              "06. volume"?: string;
            };
          }>("AlphaVantage", quoteUrl),
          fetchJsonWithRetry<{ "Time Series (Daily)"?: Record<string, { "4. close"?: string }> }>("AlphaVantage", seriesUrl),
        ]);

        const quote = quoteData["Global Quote"];
        if (!quote) {
          return null;
        }

        const price = Number(quote["05. price"] || 0);
        const rawChangePercent = Number((quote["10. change percent"] || "0").replace("%", ""));
        const dailySeries = Object.entries(seriesData["Time Series (Daily)"] || {})
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([, candle]) => Number(candle["4. close"] || 0))
          .filter((v) => v > 0);

        const timeframeSeries = buildTimeframeSeries({
          daily: dailySeries,
          fallbackPrice: price,
        });

        return sanitizeQuote({
          ticker: symbol,
          price,
          dayHigh: Number(quote["03. high"] || price || 0),
          dayLow: Number(quote["04. low"] || price || 0),
          changePercent: Number.isFinite(rawChangePercent) ? rawChangePercent : 0,
          volume: Number(quote["06. volume"] || 0),
          series: timeframeSeries["1D"],
          timeframeSeries,
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

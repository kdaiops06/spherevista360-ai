import type { MarketData, CurrencyStrength, CurrencyRate, AIPrediction, NewsItem } from "@/types";
import { fetchStockQuote, fetchExchangeRates, fetchFinanceNews } from "./data-sources";
import { fetchFreeRates } from "./free-currency-api";

// Revalidate every 5 minutes
export const revalidate = 300;

// Common return shape for all data fetchers
export interface DataResult<T> {
  data: T;
  isLive: boolean;
  source: string;
  lastUpdated: string;
}

// ─── Demo / Illustrative Data (clearly labeled as static) ────────
// These values are illustrative examples — they do NOT reflect current market conditions.
// Timestamps use a fixed past date to avoid appearing fresh.

const ILLUSTRATIVE_DATE = "2025-01-15T00:00:00Z";

const DEMO_MARKET_DATA: MarketData[] = [
  { symbol: "SPY", name: "S&P 500 ETF", price: 5842.15, change: 23.4, changePercent: 0.42, lastUpdated: ILLUSTRATIVE_DATE },
  { symbol: "DIA", name: "Dow Jones ETF", price: 43215.80, change: -45.2, changePercent: -0.10, lastUpdated: ILLUSTRATIVE_DATE },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 20124.50, change: 98.7, changePercent: 0.49, lastUpdated: ILLUSTRATIVE_DATE },
  { symbol: "GLD", name: "Gold ETF", price: 2952.30, change: 12.1, changePercent: 0.41, lastUpdated: ILLUSTRATIVE_DATE },
  { symbol: "BTC-USD", name: "Bitcoin", price: 87420.00, change: -1205.0, changePercent: -1.36, lastUpdated: ILLUSTRATIVE_DATE },
  { symbol: "TLT", name: "20Y Treasury ETF", price: 88.45, change: -0.35, changePercent: -0.39, lastUpdated: ILLUSTRATIVE_DATE },
];

const DEMO_CURRENCY_STRENGTH: CurrencyStrength[] = [
  { currency: "USD", strength: 72, change24h: 0.3, trend: "up" },
  { currency: "EUR", strength: 55, change24h: -0.2, trend: "down" },
  { currency: "GBP", strength: 60, change24h: 0.1, trend: "up" },
  { currency: "JPY", strength: 35, change24h: -0.8, trend: "down" },
  { currency: "CHF", strength: 68, change24h: 0.5, trend: "up" },
  { currency: "AUD", strength: 45, change24h: -0.4, trend: "down" },
  { currency: "CAD", strength: 52, change24h: 0.1, trend: "stable" },
  { currency: "NZD", strength: 40, change24h: -0.3, trend: "down" },
];

const DEMO_RATES: CurrencyRate[] = [
  { base: "USD", target: "EUR", rate: 0.9234, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "GBP", rate: 0.7891, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "JPY", rate: 149.85, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "CHF", rate: 0.8812, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "AUD", rate: 1.5423, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "CAD", rate: 1.3567, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "CNY", rate: 7.2341, lastUpdated: ILLUSTRATIVE_DATE },
  { base: "USD", target: "INR", rate: 83.42, lastUpdated: ILLUSTRATIVE_DATE },
];

const DEMO_PREDICTIONS: AIPrediction[] = [
  { asset: "S&P 500", prediction: "bullish", confidence: 0.72, timeframe: "1 month", reasoning: "Strong earnings growth, stable monetary policy, and positive labor market data support continued upside momentum.", generatedAt: ILLUSTRATIVE_DATE },
  { asset: "Gold (XAU)", prediction: "bullish", confidence: 0.65, timeframe: "3 months", reasoning: "Geopolitical tensions, central bank buying, and inflation hedging are supporting gold prices near all-time highs.", generatedAt: ILLUSTRATIVE_DATE },
  { asset: "EUR/USD", prediction: "neutral", confidence: 0.55, timeframe: "1 week", reasoning: "ECB and Fed policy convergence continues to limit directional bias in the near term.", generatedAt: ILLUSTRATIVE_DATE },
  { asset: "Bitcoin (BTC)", prediction: "bullish", confidence: 0.60, timeframe: "1 month", reasoning: "Institutional adoption, ETF flows, and post-halving cycle dynamics support higher prices.", generatedAt: ILLUSTRATIVE_DATE },
  { asset: "10Y Treasury", prediction: "bearish", confidence: 0.58, timeframe: "3 months", reasoning: "Persistent inflation and government debt supply pressure are pushing yields higher.", generatedAt: ILLUSTRATIVE_DATE },
  { asset: "Crude Oil (WTI)", prediction: "neutral", confidence: 0.50, timeframe: "1 month", reasoning: "Supply cuts vs. demand uncertainty create a balanced outlook.", generatedAt: ILLUSTRATIVE_DATE },
];

const DEMO_NEWS: NewsItem[] = [
  { title: "Fed Signals Patience on Rate Cuts Amid Sticky Inflation", description: "Federal Reserve officials indicated they're in no rush to cut interest rates, citing persistent inflationary pressures.", url: "#", source: "Reuters", publishedAt: ILLUSTRATIVE_DATE, category: "finance" },
  { title: "Tech Stocks Rally as AI Spending Accelerates", description: "Major technology companies saw share prices surge as artificial intelligence investment continues to grow.", url: "#", source: "Bloomberg", publishedAt: ILLUSTRATIVE_DATE, category: "finance" },
  { title: "Oil Prices Surge on Middle East Supply Concerns", description: "Crude oil prices jumped amid escalating geopolitical tensions threatening supply routes.", url: "#", source: "CNBC", publishedAt: ILLUSTRATIVE_DATE, category: "finance" },
  { title: "ECB Holds Rates Steady, Eyes June for Next Move", description: "The European Central Bank kept rates unchanged, signaling a potential cut in June.", url: "#", source: "Financial Times", publishedAt: ILLUSTRATIVE_DATE, category: "finance" },
  { title: "Housing Market Shows Signs of Recovery in Spring Season", description: "Home sales and new listings are picking up as mortgage rates stabilize.", url: "#", source: "WSJ", publishedAt: ILLUSTRATIVE_DATE, category: "finance" },
];

// ─── Live Data Fetchers (with graceful fallback + metadata) ──────

const MARKET_SYMBOLS = ["SPY", "DIA", "QQQ", "GLD", "BTC-USD", "TLT"];

export async function getMarketData(): Promise<DataResult<MarketData[]>> {
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    return { data: DEMO_MARKET_DATA, isLive: false, source: "Illustrative data", lastUpdated: ILLUSTRATIVE_DATE };
  }

  try {
    const results = await Promise.allSettled(
      MARKET_SYMBOLS.map((s) => fetchStockQuote(s))
    );
    const live = results
      .filter((r): r is PromiseFulfilledResult<MarketData> => r.status === "fulfilled")
      .map((r) => r.value);

    return live.length > 0
      ? { data: live, isLive: true, source: "Alpha Vantage", lastUpdated: new Date().toISOString() }
      : { data: DEMO_MARKET_DATA, isLive: false, source: "Illustrative data", lastUpdated: ILLUSTRATIVE_DATE };
  } catch {
    return { data: DEMO_MARKET_DATA, isLive: false, source: "Illustrative data", lastUpdated: ILLUSTRATIVE_DATE };
  }
}

export async function getCurrencyRates(): Promise<DataResult<CurrencyRate[]>> {
  // Try free ECB API first (no key needed)
  try {
    const freeResult = await fetchFreeRates("USD");
    const targetCurrencies = ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "CNY", "INR"];
    const filtered = freeResult.rates.filter((r) => targetCurrencies.includes(r.target));
    if (filtered.length > 0) {
      return { data: filtered, isLive: true, source: freeResult.source, lastUpdated: freeResult.lastUpdated };
    }
  } catch {
    // free API failed — try paid
  }

  // Try paid API
  if (process.env.EXCHANGERATE_API_KEY) {
    try {
      const allRates = await fetchExchangeRates("USD");
      const targetCurrencies = ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "CNY", "INR"];
      const filtered = allRates.filter((r) => targetCurrencies.includes(r.target));
      if (filtered.length > 0) {
        return { data: filtered, isLive: true, source: "ExchangeRate API", lastUpdated: new Date().toISOString() };
      }
    } catch {
      // paid also failed
    }
  }

  return { data: DEMO_RATES, isLive: false, source: "Illustrative data", lastUpdated: ILLUSTRATIVE_DATE };
}

export async function getCurrencyStrength(): Promise<DataResult<CurrencyStrength[]>> {
  // Try free ECB API for strength computation
  try {
    const freeResult = await fetchFreeRates("USD");
    const rateMap = new Map(freeResult.rates.map((r) => [r.target, r.rate]));

    const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"];
    const strength: CurrencyStrength[] = currencies.map((currency) => {
      let s: number;
      if (currency === "USD") {
        s = 70;
      } else {
        const rate = rateMap.get(currency) || 1;
        // Higher rate (weaker vs USD) = lower strength; invert and scale
        s = Math.round(Math.max(20, Math.min(90, 100 / rate)));
      }
      // Without historical data, we mark trend as stable (no random values)
      return {
        currency,
        strength: s,
        change24h: 0,
        trend: "stable" as const,
      };
    });

    return { data: strength, isLive: true, source: freeResult.source, lastUpdated: freeResult.lastUpdated };
  } catch {
    // free API failed
  }

  // Try paid API
  if (process.env.EXCHANGERATE_API_KEY) {
    try {
      const allRates = await fetchExchangeRates("USD");
      const rateMap = new Map(allRates.map((r) => [r.target, r.rate]));

      const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"];
      const strength: CurrencyStrength[] = currencies.map((currency) => {
        let s: number;
        if (currency === "USD") {
          s = 70;
        } else {
          const rate = rateMap.get(currency) || 1;
          s = Math.round(Math.max(20, Math.min(90, 100 / rate)));
        }
        return {
          currency,
          strength: s,
          change24h: 0,
          trend: "stable" as const,
        };
      });

      return { data: strength, isLive: true, source: "ExchangeRate API", lastUpdated: new Date().toISOString() };
    } catch {
      // paid also failed
    }
  }

  return { data: DEMO_CURRENCY_STRENGTH, isLive: false, source: "Illustrative data", lastUpdated: ILLUSTRATIVE_DATE };
}

export async function getLatestNews(): Promise<DataResult<NewsItem[]>> {
  if (!process.env.NEWS_API_KEY) {
    return { data: DEMO_NEWS, isLive: false, source: "Sample headlines", lastUpdated: ILLUSTRATIVE_DATE };
  }

  try {
    const articles = await fetchFinanceNews("finance economy markets stocks");
    return articles.length > 0
      ? { data: articles.slice(0, 10), isLive: true, source: "NewsAPI", lastUpdated: new Date().toISOString() }
      : { data: DEMO_NEWS, isLive: false, source: "Sample headlines", lastUpdated: ILLUSTRATIVE_DATE };
  } catch {
    return { data: DEMO_NEWS, isLive: false, source: "Sample headlines", lastUpdated: ILLUSTRATIVE_DATE };
  }
}

export async function getPredictions(): Promise<DataResult<AIPrediction[]>> {
  // Predictions require AI API — return demo with clear label
  return { data: DEMO_PREDICTIONS, isLive: false, source: "Sample predictions (AI not configured)", lastUpdated: ILLUSTRATIVE_DATE };
}

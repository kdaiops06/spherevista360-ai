import { WATCHLIST_PROVIDER_ORDER } from "@/lib/watchlist-ai/providers";
import type {
  CardTimeframe,
  RawProviderQuote,
  WatchlistAlert,
  WatchlistSnapshot,
  WatchlistStockItem,
  WatchlistTimeframe,
} from "@/lib/watchlist-ai/types";

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META"];
const CACHE_TTL_SECONDS = Number(process.env.WATCHLIST_AI_CACHE_TTL_SECONDS || 45);
const POLL_INTERVAL_SECONDS = Number(process.env.WATCHLIST_AI_POLL_INTERVAL_SECONDS || 20);
const ALERT_DROP_THRESHOLD = Number(process.env.WATCHLIST_AI_ALERT_DROP_THRESHOLD || 3.5);
const ALERT_CRASH_THRESHOLD = 10;
const ALERT_VOLATILITY_THRESHOLD = Number(process.env.WATCHLIST_AI_ALERT_VOLATILITY_THRESHOLD || 72);
const ALERT_VOLUME_SPIKE_RATIO = Number(process.env.WATCHLIST_AI_ALERT_VOLUME_SPIKE_RATIO || 1.7);

const watchlistCache = new Map<string, { expiresAt: number; value: WatchlistSnapshot }>();
const previousVolume = new Map<string, number>();

const stockMetadata: Record<
  string,
  { name: string; sector: string; assetType: "stock" | "etf" | "crypto"; marketCap?: number }
> = {
  AAPL: { name: "Apple Inc.", sector: "Technology", assetType: "stock", marketCap: 2_900_000_000_000 },
  MSFT: { name: "Microsoft Corp.", sector: "Technology", assetType: "stock", marketCap: 3_100_000_000_000 },
  NVDA: { name: "NVIDIA Corp.", sector: "Semiconductors", assetType: "stock", marketCap: 2_300_000_000_000 },
  GOOGL: { name: "Alphabet Inc.", sector: "Communication Services", assetType: "stock", marketCap: 2_000_000_000_000 },
  AMZN: { name: "Amazon.com Inc.", sector: "Consumer Discretionary", assetType: "stock", marketCap: 1_900_000_000_000 },
  TSLA: { name: "Tesla Inc.", sector: "Automotive", assetType: "stock", marketCap: 620_000_000_000 },
  SPY: { name: "SPDR S&P 500 ETF", sector: "ETF", assetType: "etf", marketCap: 520_000_000_000 },
  QQQ: { name: "Invesco QQQ Trust", sector: "ETF", assetType: "etf", marketCap: 300_000_000_000 },
  META: { name: "Meta Platforms Inc.", sector: "Communication Services", assetType: "stock", marketCap: 1_200_000_000_000 },
  NFLX: { name: "Netflix Inc.", sector: "Communication Services", assetType: "stock", marketCap: 290_000_000_000 },
  AMD: { name: "Advanced Micro Devices", sector: "Semiconductors", assetType: "stock", marketCap: 280_000_000_000 },
  BTCUSD: { name: "Bitcoin", sector: "Crypto", assetType: "crypto" },
};

const fallbackBasePrice: Record<string, number> = {
  AAPL: 212.45,
  MSFT: 463.2,
  NVDA: 1208.95,
  TSLA: 183.55,
  GOOGL: 176.7,
  AMZN: 191.3,
  META: 521.8,
  AMD: 168.2,
  NFLX: 694.4,
  PLTR: 30.6,
  BTCUSD: 67320,
  ETHUSD: 3180,
  SPY: 528.3,
  QQQ: 457.8,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSymbols(symbols?: string[]): string[] {
  const normalized = (symbols || DEFAULT_SYMBOLS)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  if (normalized.length === 0) {
    return DEFAULT_SYMBOLS;
  }
  return Array.from(new Set(normalized));
}

function buildCacheKey(symbols: string[], timeframe: WatchlistTimeframe): string {
  return `${timeframe}:${symbols.join(",")}`;
}

function inferTrend(series: number[]): "up" | "down" | "flat" {
  if (series.length < 2) {
    return "flat";
  }
  const first = series[0];
  const last = series[series.length - 1];
  const delta = last - first;
  if (Math.abs(delta) < first * 0.002) {
    return "flat";
  }
  return delta > 0 ? "up" : "down";
}

function createDeterministicSeries(price: number, changePercent: number): number[] {
  const points = 22;
  const base = price / (1 + changePercent / 100 || 1);
  const series: number[] = [];

  for (let index = 0; index < points; index += 1) {
    const t = index / (points - 1);
    const drift = base + (price - base) * t;
    const wave = Math.sin(index * 0.9) * price * 0.0022;
    series.push(Number((drift + wave).toFixed(2)));
  }

  return series;
}

function computeVolatilityScore(quote: RawProviderQuote): number {
  const range = quote.dayHigh > quote.dayLow ? (quote.dayHigh - quote.dayLow) / quote.dayLow : 0;
  const changeComponent = Math.abs(quote.changePercent) * 10;
  const rangeComponent = range * 480;
  return clamp(Math.round(changeComponent + rangeComponent), 5, 100);
}

function computeMomentumScore(quote: RawProviderQuote, series: number[]): number {
  const slope = series.length > 1 ? (series[series.length - 1] - series[0]) / series[0] : 0;
  const score = 50 + quote.changePercent * 4 + slope * 180;
  return clamp(Math.round(score), 0, 100);
}

function computeRsi(series: number[], period = 14): number {
  if (series.length <= period) {
    return 50;
  }

  let gains = 0;
  let losses = 0;
  for (let index = series.length - period; index < series.length; index += 1) {
    const prev = series[index - 1];
    const next = series[index];
    const delta = next - prev;
    if (delta > 0) {
      gains += delta;
    } else {
      losses += Math.abs(delta);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) {
    return 70;
  }

  const rs = avgGain / avgLoss;
  return clamp(Math.round(100 - 100 / (1 + rs)), 10, 90);
}

function reshapeSeries(baseSeries: number[], points: number, amplitudeFactor: number): number[] {
  if (baseSeries.length === 0) {
    return [];
  }

  const first = baseSeries[0];
  const last = baseSeries[baseSeries.length - 1];
  const trend = last - first;
  const synthetic: number[] = [];

  for (let index = 0; index < points; index += 1) {
    const t = index / Math.max(points - 1, 1);
    const drift = first + trend * t;
    const wave = Math.sin(index * 0.75) * first * amplitudeFactor;
    synthetic.push(Number((drift + wave).toFixed(2)));
  }

  return synthetic;
}

function buildTimeframeInsights(baseSeries: number[]) {
  const map = new Map<CardTimeframe, { points: number; amp: number }>([
    ["1D", { points: 22, amp: 0.0025 }],
    ["1W", { points: 18, amp: 0.0045 }],
    ["1M", { points: 20, amp: 0.0065 }],
    ["3M", { points: 24, amp: 0.009 }],
  ]);

  const insights = {} as Record<
    CardTimeframe,
    {
      timeframe: CardTimeframe;
      changePercent: number;
      trendDirection: "up" | "down" | "flat";
      volatilityScore: number;
      series: number[];
    }
  >;

  for (const [key, config] of map.entries()) {
    const series = reshapeSeries(baseSeries, config.points, config.amp);
    const first = series[0] || 0;
    const last = series[series.length - 1] || first;
    const changePercent = first > 0 ? ((last - first) / first) * 100 : 0;
    const low = Math.min(...series);
    const high = Math.max(...series);
    const volatility = low > 0 ? ((high - low) / low) * 100 : 0;

    insights[key] = {
      timeframe: key,
      changePercent: Number(changePercent.toFixed(2)),
      trendDirection: inferTrend(series),
      volatilityScore: clamp(Math.round(volatility * 8), 5, 100),
      series,
    };
  }

  return insights;
}

function buildAiAnalysis(args: {
  changePercent: number;
  momentumScore: number;
  volatilityScore: number;
  volumeSpike: boolean;
}): string {
  const { changePercent, momentumScore, volatilityScore, volumeSpike } = args;

  if (volumeSpike && changePercent < 0) {
    return "Volume divergence warning with distribution pressure detected.";
  }
  if (momentumScore >= 72 && changePercent > 0) {
    return "Bullish accumulation detected with trend continuation probability rising.";
  }
  if (momentumScore <= 35 && changePercent < 0) {
    return "Momentum weakening after recent move; defensive positioning is increasing.";
  }
  if (volatilityScore >= ALERT_VOLATILITY_THRESHOLD) {
    return "Unusual volatility regime detected; expect wider intraday price swings.";
  }
  return "Strong recovery probability remains intact if support levels hold.";
}

function buildSentiment(momentumScore: number, changePercent: number): "bullish" | "bearish" | "neutral" {
  if (momentumScore >= 65 || changePercent >= 1.2) {
    return "bullish";
  }
  if (momentumScore <= 35 || changePercent <= -1.2) {
    return "bearish";
  }
  return "neutral";
}

function buildAlerts(items: WatchlistStockItem[]): WatchlistAlert[] {
  const alerts: WatchlistAlert[] = [];
  const now = new Date().toISOString();

  for (const item of items) {
    if (item.changePercent <= -Math.abs(ALERT_DROP_THRESHOLD)) {
      alerts.push({
        id: `${item.ticker}-drop-${now}`,
        ticker: item.ticker,
        type: "price-drop",
        severity: item.changePercent <= -ALERT_CRASH_THRESHOLD ? "critical" : "warning",
        title: `${item.ticker} rapid downside move`,
        message: `${item.ticker} is down ${item.changePercent.toFixed(2)}%, breaching the configured drop threshold.`,
        createdAt: now,
      });
    }

    if (item.volatilityScore >= ALERT_VOLATILITY_THRESHOLD) {
      alerts.push({
        id: `${item.ticker}-vol-${now}`,
        ticker: item.ticker,
        type: "volatility-spike",
        severity: item.volatilityScore >= 84 ? "critical" : "warning",
        title: `${item.ticker} volatility spike`,
        message: `${item.ticker} volatility score reached ${item.volatilityScore}/100.`,
        createdAt: now,
      });
    }

    const prevVolume = previousVolume.get(item.ticker) || 0;
    const ratio = prevVolume > 0 ? item.volume / prevVolume : 1;
    if (prevVolume > 0 && ratio >= ALERT_VOLUME_SPIKE_RATIO) {
      alerts.push({
        id: `${item.ticker}-volume-${now}`,
        ticker: item.ticker,
        type: "volume-spike",
        severity: ratio >= ALERT_VOLUME_SPIKE_RATIO * 1.5 ? "critical" : "warning",
        title: `${item.ticker} unusual volume`,
        message: `${item.ticker} volume is ${ratio.toFixed(2)}x the previous read.`,
        createdAt: now,
      });
    }

    if (item.momentumScore >= 70 && item.changePercent < 0) {
      alerts.push({
        id: `${item.ticker}-divergence-${now}`,
        ticker: item.ticker,
        type: "momentum-divergence",
        severity: "warning",
        title: `${item.ticker} momentum divergence`,
        message: "Momentum and price action diverged. Distribution pressure may be rising.",
        createdAt: now,
      });
    }

    if (item.volatilityScore >= 80 && item.rsiScore <= 30) {
      alerts.push({
        id: `${item.ticker}-unusual-${now}`,
        ticker: item.ticker,
        type: "unusual-trading",
        severity: "critical",
        title: `${item.ticker} unusual trading behavior`,
        message: "Extreme volatility and oversold RSI detected in the same regime.",
        createdAt: now,
      });
    }
  }

  return alerts;
}

function buildFallbackQuotes(symbols: string[]): RawProviderQuote[] {
  const nowMinute = Math.floor(Date.now() / 60_000);
  return symbols.map((ticker, index) => {
    const base = fallbackBasePrice[ticker] || 100 + index * 15;
    const wave = Math.sin(nowMinute + index) * 0.8;
    const changePercent = Number((wave * 0.7).toFixed(2));
    const price = Number((base * (1 + changePercent / 100)).toFixed(2));
    const dayRange = Math.max(0.8, price * 0.015);

    return {
      ticker,
      price,
      changePercent,
      dayHigh: Number((price + dayRange).toFixed(2)),
      dayLow: Number((price - dayRange).toFixed(2)),
      volume: Math.round(900_000 + (Math.cos(nowMinute + index * 2) + 1) * 350_000),
      series: createDeterministicSeries(price, changePercent),
      marketCap: stockMetadata[ticker]?.marketCap ?? null,
      companyName: stockMetadata[ticker]?.name,
      sector: stockMetadata[ticker]?.sector,
    };
  });
}

async function fetchProviderQuotes(symbols: string[], timeframe: WatchlistTimeframe) {
  for (const provider of WATCHLIST_PROVIDER_ORDER) {
    if (!provider.isConfigured()) {
      continue;
    }

    try {
      const quotes = await provider.fetchQuotes({ symbols, timeframe });
      if (quotes.length > 0) {
        return {
          quotes,
          source: provider.name,
          isLive: true,
          fallbackUsed: false,
        };
      }
    } catch (error) {
      console.warn(`[watchlist-ai] ${provider.name} fetch failed`, error);
    }
  }

  return {
    quotes: buildFallbackQuotes(symbols),
    source: "Fallback simulated feed",
    isLive: false,
    fallbackUsed: true,
    fallbackReason:
      "No external stock provider responded. Displaying deterministic fallback data until live APIs recover.",
  };
}

function toStockItem(quote: RawProviderQuote, live: boolean): WatchlistStockItem {
  const meta = stockMetadata[quote.ticker] || {
    name: quote.companyName || quote.ticker,
    sector: quote.sector || "General",
    assetType: "stock" as const,
  };

  const series = quote.series && quote.series.length > 2 ? quote.series : createDeterministicSeries(quote.price, quote.changePercent);
  const timeframeInsights = buildTimeframeInsights(series);
  const volatilityScore = computeVolatilityScore(quote);
  const momentumScore = computeMomentumScore(quote, series);
  const rsiScore = computeRsi(series);
  const trendDirection = inferTrend(series);
  const sentiment = buildSentiment(momentumScore, quote.changePercent);
  const prevVolume = previousVolume.get(quote.ticker) || 0;
  const volumeSpike = prevVolume > 0 ? quote.volume / prevVolume >= ALERT_VOLUME_SPIKE_RATIO : false;
  const aiAnalysis = buildAiAnalysis({
    changePercent: quote.changePercent,
    momentumScore,
    volatilityScore,
    volumeSpike,
  });

  previousVolume.set(quote.ticker, quote.volume);

  const dayRange = quote.dayHigh - quote.dayLow;
  const priceRangePosition = dayRange > 0 ? ((quote.price - quote.dayLow) / dayRange) * 100 : 50;
  const aiConfidence = clamp(Math.round(58 + Math.abs(momentumScore - 50) * 0.6 + (volumeSpike ? 8 : 0)), 50, 98);
  const supportZone = Number((Math.min(...series) * 0.995).toFixed(2));
  const resistanceZone = Number((Math.max(...series) * 1.005).toFixed(2));
  const relativeStrength = clamp(Math.round((momentumScore * 0.65 + (100 - volatilityScore) * 0.35)), 0, 100);
  const anomalyFlags = [] as string[];

  if (quote.changePercent <= -ALERT_CRASH_THRESHOLD) {
    anomalyFlags.push("crash");
  }
  if (volatilityScore >= ALERT_VOLATILITY_THRESHOLD) {
    anomalyFlags.push("volatility");
  }
  if (volumeSpike) {
    anomalyFlags.push("volume");
  }
  if (momentumScore >= 70 && quote.changePercent < 0) {
    anomalyFlags.push("divergence");
  }

  return {
    ticker: quote.ticker,
    companyName: quote.companyName || meta.name,
    sector: quote.sector || meta.sector,
    assetType: meta.assetType,
    price: Number(quote.price.toFixed(2)),
    changePercent: Number(quote.changePercent.toFixed(2)),
    marketCap: quote.marketCap ?? meta.marketCap ?? null,
    volume: Math.round(quote.volume),
    dayHigh: Number(quote.dayHigh.toFixed(2)),
    dayLow: Number(quote.dayLow.toFixed(2)),
    volatilityScore,
    momentumScore,
    rsiScore,
    relativeStrength,
    supportZone,
    resistanceZone,
    priceRangePosition: clamp(Number(priceRangePosition.toFixed(1)), 0, 100),
    miniSeries: series,
    timeframeInsights,
    sentiment,
    trendDirection,
    realtimeUpdated: live,
    aiAnalysis,
    bullishLabel: sentiment === "bearish" ? "bearish" : "bullish",
    aiConfidence,
    anomalyFlags,
    updatedAt: new Date().toISOString(),
  };
}

export async function getWatchlistSnapshot(params: {
  symbols?: string[];
  timeframe?: WatchlistTimeframe;
  forceRefresh?: boolean;
}): Promise<WatchlistSnapshot> {
  const timeframe = params.timeframe || "1D";
  const symbols = normalizeSymbols(params.symbols);
  const cacheKey = buildCacheKey(symbols, timeframe);
  const now = Date.now();
  const ttlMs = Math.max(5, CACHE_TTL_SECONDS) * 1000;

  if (!params.forceRefresh) {
    const cached = watchlistCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
  }

  const providerResult = await fetchProviderQuotes(symbols, timeframe);
  const items = providerResult.quotes
    .map((quote) => toStockItem(quote, providerResult.isLive))
    .sort((a, b) => b.momentumScore - a.momentumScore);

  const alerts = buildAlerts(items);
  const topMovers = [...items]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);

  const riskSignals = [
    {
      label: "Portfolio Heat",
      score: clamp(Math.round(items.reduce((sum, item) => sum + item.volatilityScore, 0) / Math.max(items.length, 1)), 0, 100),
      detail: "Cross-watchlist volatility and dispersion score.",
    },
    {
      label: "Momentum Breadth",
      score: clamp(Math.round(items.reduce((sum, item) => sum + item.momentumScore, 0) / Math.max(items.length, 1)), 0, 100),
      detail: "Average momentum strength across tracked symbols.",
    },
    {
      label: "Alert Pressure",
      score: clamp(alerts.length * 14, 0, 100),
      detail: "Aggregate intensity based on active drop/volatility/volume alerts.",
    },
  ];

  const snapshot: WatchlistSnapshot = {
    timeframe,
    source: providerResult.source,
    isLive: providerResult.isLive,
    fallbackUsed: providerResult.fallbackUsed,
    fallbackReason: providerResult.fallbackReason,
    updatedAt: new Date().toISOString(),
    items,
    alerts,
    topMovers,
    riskSignals,
    pollIntervalSeconds: Math.max(10, POLL_INTERVAL_SECONDS),
  };

  watchlistCache.set(cacheKey, {
    expiresAt: now + ttlMs,
    value: snapshot,
  });

  return snapshot;
}

import { WATCHLIST_PROVIDER_ORDER } from "@/lib/watchlist-ai/providers";
import { recordStaleFeedWarning } from "@/lib/watchlist-ai/provider-diagnostics";
import type {
  CardTimeframe,
  RawProviderQuote,
  StockFundamentals,
  TechnicalSignals,
  TimeframeInsight,
  ProviderHealthStatus,
  WatchlistAlert,
  WatchlistScreenerPanel,
  WatchlistSnapshot,
  WatchlistStockItem,
  WatchlistTimeframe,
} from "@/lib/watchlist-ai/types";

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META"];
const CACHE_TTL_SECONDS = Number(process.env.WATCHLIST_AI_CACHE_TTL_SECONDS || 45);
const POLL_INTERVAL_SECONDS = Number(process.env.WATCHLIST_AI_POLL_INTERVAL_SECONDS || 10);
const ALERT_DROP_THRESHOLD = Number(process.env.WATCHLIST_AI_ALERT_DROP_THRESHOLD || 3.5);
const ALERT_CRASH_THRESHOLD = 10;
const ALERT_VOLATILITY_THRESHOLD = Number(process.env.WATCHLIST_AI_ALERT_VOLATILITY_THRESHOLD || 72);
const ALERT_VOLUME_SPIKE_RATIO = Number(process.env.WATCHLIST_AI_ALERT_VOLUME_SPIKE_RATIO || 1.7);

const watchlistCache = new Map<string, { expiresAt: number; value: WatchlistSnapshot }>();
const inflightSnapshots = new Map<string, Promise<WatchlistSnapshot>>();
const previousVolume = new Map<string, number>();

const stockMetadata: Record<string, { name: string; sector: string; assetType: "stock" | "etf" | "crypto"; marketCap?: number }> = {
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
  ETHUSD: { name: "Ethereum", sector: "Crypto", assetType: "crypto" },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSymbols(symbols?: string[]): string[] {
  const normalized = (symbols || DEFAULT_SYMBOLS)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  return normalized.length > 0 ? Array.from(new Set(normalized)) : DEFAULT_SYMBOLS;
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
  if (Math.abs(delta) < Math.max(0.01, first * 0.002)) {
    return "flat";
  }
  return delta > 0 ? "up" : "down";
}

function computeVolatilityScore(series: number[]): number {
  if (series.length < 2) {
    return 20;
  }
  const high = Math.max(...series);
  const low = Math.min(...series);
  if (low <= 0) {
    return 20;
  }
  const volatilityPct = ((high - low) / low) * 100;
  return clamp(Math.round(volatilityPct * 4.5), 5, 100);
}

function computeMomentumScore(changePercent: number, series: number[]): number {
  if (series.length < 2) {
    return clamp(Math.round(50 + changePercent * 2.5), 0, 100);
  }
  const slope = (series[series.length - 1] - series[0]) / Math.max(series[0], 0.01);
  const score = 50 + changePercent * 3.5 + slope * 165;
  return clamp(Math.round(score), 0, 100);
}

function computeRsi(series: number[], period = 14): number {
  if (series.length <= period) {
    return 50;
  }

  let gains = 0;
  let losses = 0;
  for (let i = series.length - period; i < series.length; i += 1) {
    const prev = series[i - 1];
    const next = series[i];
    const delta = next - prev;
    if (delta >= 0) {
      gains += delta;
    } else {
      losses += Math.abs(delta);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) {
    return 72;
  }

  const rs = avgGain / avgLoss;
  return clamp(Math.round(100 - 100 / (1 + rs)), 10, 90);
}

function sma(series: number[], period: number): number | null {
  if (series.length < period) {
    return null;
  }
  const slice = series.slice(series.length - period);
  return Number((slice.reduce((sum, n) => sum + n, 0) / period).toFixed(2));
}

function ema(series: number[], period: number): number | null {
  if (series.length < period) {
    return null;
  }
  const k = 2 / (period + 1);
  let value = series[0];
  for (let i = 1; i < series.length; i += 1) {
    value = series[i] * k + value * (1 - k);
  }
  return Number(value.toFixed(2));
}

function computeMacdTrend(series: number[]): "bullish" | "bearish" | "neutral" {
  const ema12 = ema(series, 12);
  const ema26 = ema(series, 26);
  if (ema12 == null || ema26 == null) {
    return "neutral";
  }
  const macd = ema12 - ema26;
  if (macd > 0.4) {
    return "bullish";
  }
  if (macd < -0.4) {
    return "bearish";
  }
  return "neutral";
}

function normalizeFundamentals(input?: Partial<StockFundamentals>): StockFundamentals {
  const n = (value: unknown): number | null => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  return {
    peRatio: n(input?.peRatio),
    forwardPe: n(input?.forwardPe),
    pbRatio: n(input?.pbRatio),
    pegRatio: n(input?.pegRatio),
    debtToEquity: n(input?.debtToEquity),
    eps: n(input?.eps),
    revenue: n(input?.revenue),
    revenueGrowth: n(input?.revenueGrowth),
    operatingMargin: n(input?.operatingMargin),
    roe: n(input?.roe),
    roce: n(input?.roce),
    freeCashFlow: n(input?.freeCashFlow),
    dividendYield: n(input?.dividendYield),
    beta: n(input?.beta),
  };
}

function buildTimeframeInsights(quote: RawProviderQuote): Record<CardTimeframe, TimeframeInsight> {
  const source = quote.timeframeSeries || {};

  const raw: Record<CardTimeframe, number[]> = {
    "1D": source["1D"] && source["1D"]!.length > 1 ? source["1D"]! : [],
    "1W": source["1W"] && source["1W"]!.length > 1 ? source["1W"]! : [],
    "1M": source["1M"] && source["1M"]!.length > 1 ? source["1M"]! : [],
    "3M": source["3M"] && source["3M"]!.length > 1 ? source["3M"]! : [],
  };

  const insights = {} as Record<CardTimeframe, TimeframeInsight>;
  (Object.keys(raw) as CardTimeframe[]).forEach((tf) => {
    const series = raw[tf].map((v) => Number(v.toFixed(2)));
    const first = series[0] || quote.price;
    const last = series[series.length - 1] || first;
    const changePercent = first > 0 ? ((last - first) / first) * 100 : 0;

    insights[tf] = {
      timeframe: tf,
      changePercent: Number(changePercent.toFixed(2)),
      trendDirection: inferTrend(series),
      volatilityScore: computeVolatilityScore(series),
      series,
    };
  });

  return insights;
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

function buildAiNarrative(args: {
  changePercent: number;
  momentumScore: number;
  volatilityScore: number;
  volumeSpike: boolean;
  rsi: number;
  macdTrend: "bullish" | "bearish" | "neutral";
}): string {
  const { changePercent, momentumScore, volatilityScore, volumeSpike, rsi, macdTrend } = args;

  if (volumeSpike && changePercent < 0) {
    return "Distribution pressure detected with rising sell-side participation.";
  }
  if (momentumScore > 72 && macdTrend === "bullish") {
    return "Bullish continuation probability remains elevated while momentum breadth holds.";
  }
  if (rsi > 72 && volatilityScore > 60) {
    return "Overbought + unstable regime: breakout may fade without sustained volume.";
  }
  if (rsi < 35 && macdTrend !== "bearish") {
    return "Oversold recovery setup forming; watch for confirmation above short-term averages.";
  }
  if (volatilityScore >= ALERT_VOLATILITY_THRESHOLD) {
    return "High volatility breakdown risk detected. Position sizing discipline required.";
  }
  return "Trend is constructive but requires confirmation from breadth and volume behavior.";
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
        title: `${item.ticker} downside acceleration`,
        message: `${item.ticker} is down ${item.changePercent.toFixed(2)}% and crossed the configured downside threshold.`,
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
        message: `Volatility score at ${item.volatilityScore}/100. Wider intraday swings expected.`,
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
        message: `${item.ticker} volume is ${ratio.toFixed(2)}x the previous interval.`,
        createdAt: now,
      });
    }

    if (item.technicalSignals.rsi >= 75 && item.changePercent >= 0) {
      alerts.push({
        id: `${item.ticker}-overbought-${now}`,
        ticker: item.ticker,
        type: "momentum-divergence",
        severity: "warning",
        title: `${item.ticker} overbought pressure`,
        message: "RSI suggests stretched move. Watch for consolidation or reversal setup.",
        createdAt: now,
      });
    }

    previousVolume.set(item.ticker, item.volume);
  }

  return alerts;
}

async function fetchProviderQuotes(symbols: string[], timeframe: WatchlistTimeframe) {
  const providerHealth: ProviderHealthStatus[] = WATCHLIST_PROVIDER_ORDER.map((provider) => ({
    provider: provider.name,
    configured: provider.isConfigured(),
    ok: false,
    status: provider.isConfigured() ? "degraded" : "unavailable",
  }));

  for (const provider of WATCHLIST_PROVIDER_ORDER) {
    const providerEntry = providerHealth.find((entry) => entry.provider === provider.name);
    if (!provider.isConfigured()) {
      if (providerEntry) {
        providerEntry.error = "not_configured";
        providerEntry.status = "unavailable";
        providerEntry.reachable = false;
      }
      continue;
    }

    try {
      const start = Date.now();
      const quotes = await provider.fetchQuotes({ symbols, timeframe });
      if (quotes.length > 0) {
        if (providerEntry) {
          providerEntry.ok = true;
          providerEntry.latencyMs = Date.now() - start;
          providerEntry.lastSuccessAt = new Date().toISOString();
          providerEntry.status = "healthy";
          providerEntry.reachable = true;
          providerEntry.stale = false;
        }
        return {
          quotes,
          source: provider.name,
          isLive: true,
          fallbackUsed: false,
          providerHealth,
        };
      }
      if (providerEntry) {
        providerEntry.error = "empty_response";
        providerEntry.status = "degraded";
        providerEntry.reachable = true;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "provider_error";
      if (providerEntry) {
        providerEntry.error = message;
        providerEntry.reachable = false;
        const lowered = message.toLowerCase();
        if ((lowered.includes("invalid") && lowered.includes("key")) || lowered.includes("http 401") || lowered.includes("unauthorized")) {
          providerEntry.status = "invalid-key";
        } else if ((lowered.includes("rate") && lowered.includes("limit")) || lowered.includes("http 429") || lowered.includes("budget exhausted")) {
          providerEntry.status = "rate-limited";
        } else if (lowered.includes("timeout") || lowered.includes("abort") || lowered.includes("network") || lowered.includes("empty_response")) {
          providerEntry.status = "degraded";
        } else {
          providerEntry.status = "unavailable";
        }
      }
      console.warn(`[watchlist-ai] ${provider.name} fetch failed`, error);
    }
  }

  recordStaleFeedWarning("all_providers_failed_to_return_live_quotes");
  console.error("[watchlist-ai] fallback-engaged", {
    reason: "No external stock provider responded with real market data.",
    symbols,
    timeframe,
  });

  return {
    quotes: [],
    source: "No provider available",
    isLive: false,
    fallbackUsed: true,
    fallbackReason: "No external stock provider responded with real market data.",
    providerHealth,
  };
}

function toStockItem(quote: RawProviderQuote, live: boolean): WatchlistStockItem {
  const meta = stockMetadata[quote.ticker] || {
    name: quote.companyName || quote.ticker,
    sector: quote.sector || "General",
    assetType: "stock" as const,
  };

  const timeframeInsights = buildTimeframeInsights(quote);
  const selectedSeries = timeframeInsights["1D"].series;
  const volatilityScore = computeVolatilityScore(selectedSeries);
  const momentumScore = computeMomentumScore(quote.changePercent, selectedSeries);
  const rsiScore = computeRsi(selectedSeries);
  const trendDirection = inferTrend(selectedSeries);
  const sentiment = buildSentiment(momentumScore, quote.changePercent);

  const prevVolume = previousVolume.get(quote.ticker) || 0;
  const volumeSpike = prevVolume > 0 ? quote.volume / prevVolume >= ALERT_VOLUME_SPIKE_RATIO : false;
  const macdTrend = computeMacdTrend(selectedSeries);

  const technicalSignals: TechnicalSignals = {
    rsi: rsiScore,
    macdTrend,
    sma20: sma(selectedSeries, 20),
    sma50: sma(selectedSeries, 50),
  };

  const fundamentals = normalizeFundamentals(quote.fundamentals);
  const aiConfidence = clamp(Math.round(56 + Math.abs(momentumScore - 50) * 0.65 + (volumeSpike ? 7 : 0)), 50, 98);
  const bullishProbability = clamp(Math.round(44 + (momentumScore - 50) * 0.85 + (sentiment === "bullish" ? 8 : 0)), 5, 95);
  const bearishProbability = clamp(100 - bullishProbability, 5, 95);
  const trendContinuationProbability = clamp(
    Math.round((bullishProbability * 0.58 + (100 - volatilityScore) * 0.26 + (macdTrend === "bullish" ? 14 : macdTrend === "bearish" ? -8 : 0))),
    5,
    95
  );

  const accumulationSignal: "accumulation" | "distribution" | "neutral" =
    volumeSpike && quote.changePercent > 0
      ? "accumulation"
      : volumeSpike && quote.changePercent < 0
        ? "distribution"
        : "neutral";

  const aiAnalysis = buildAiNarrative({
    changePercent: quote.changePercent,
    momentumScore,
    volatilityScore,
    volumeSpike,
    rsi: rsiScore,
    macdTrend,
  });

  const dayRange = quote.dayHigh - quote.dayLow;
  const priceRangePosition = dayRange > 0 ? ((quote.price - quote.dayLow) / dayRange) * 100 : 50;
  const supportZone =
    selectedSeries.length > 0 ? Number((Math.min(...selectedSeries) * 0.995).toFixed(2)) : Number((quote.dayLow * 0.995).toFixed(2));
  const resistanceZone =
    selectedSeries.length > 0 ? Number((Math.max(...selectedSeries) * 1.005).toFixed(2)) : Number((quote.dayHigh * 1.005).toFixed(2));
  const relativeStrength = clamp(Math.round((momentumScore * 0.66 + (100 - volatilityScore) * 0.34)), 0, 100);

  const anomalyFlags: string[] = [];
  if (quote.changePercent <= -ALERT_CRASH_THRESHOLD) {
    anomalyFlags.push("crash");
  }
  if (volatilityScore >= ALERT_VOLATILITY_THRESHOLD) {
    anomalyFlags.push("volatility");
  }
  if (volumeSpike) {
    anomalyFlags.push("volume");
  }
  if (rsiScore >= 75) {
    anomalyFlags.push("overbought");
  }
  if (rsiScore <= 30) {
    anomalyFlags.push("oversold");
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
    miniSeries: selectedSeries,
    timeframeInsights,
    sentiment,
    trendDirection,
    realtimeUpdated: live,
    aiAnalysis,
    bullishLabel: sentiment === "bearish" ? "bearish" : "bullish",
    aiConfidence,
    bullishProbability,
    bearishProbability,
    trendContinuationProbability,
    accumulationSignal,
    technicalSignals,
    fundamentals,
    anomalyFlags,
    updatedAt: new Date().toISOString(),
  };
}

function mapToCardTimeframe(timeframe: WatchlistTimeframe): CardTimeframe {
  if (timeframe === "1W") {
    return "1W";
  }
  if (timeframe === "1M") {
    return "1M";
  }
  if (timeframe === "3M" || timeframe === "1Y") {
    return "3M";
  }
  return "1D";
}

function buildScreeners(items: WatchlistStockItem[], timeframe: CardTimeframe) {
  const scoreFor = (item: WatchlistStockItem) => item.timeframeInsights[timeframe]?.changePercent ?? item.changePercent;

  return {
    biggestGainers: [...items].filter((item) => scoreFor(item) >= 10).sort((a, b) => scoreFor(b) - scoreFor(a)).slice(0, 8),
    biggestLosers: [...items].filter((item) => scoreFor(item) <= -10).sort((a, b) => scoreFor(a) - scoreFor(b)).slice(0, 8),
    highMomentum: [...items].filter((item) => item.momentumScore >= 70).sort((a, b) => b.momentumScore - a.momentumScore).slice(0, 8),
    highVolatility: [...items].filter((item) => item.volatilityScore >= 65).sort((a, b) => b.volatilityScore - a.volatilityScore).slice(0, 8),
    aiBullishPicks: [...items]
      .filter((item) => item.sentiment === "bullish" && item.bullishProbability >= 60)
      .sort((a, b) => b.bullishProbability - a.bullishProbability)
      .slice(0, 8),
    aiBearishWarnings: [...items]
      .filter((item) => item.sentiment === "bearish" && item.bearishProbability >= 58)
      .sort((a, b) => b.bearishProbability - a.bearishProbability)
      .slice(0, 8),
  };
}

function buildSmartPanels(items: WatchlistStockItem[]): WatchlistScreenerPanel[] {
  const panel = (title: string, description: string, list: WatchlistStockItem[]) => ({
    title,
    description,
    items: list.slice(0, 6),
  });

  return [
    panel(
      "Momentum Leaders",
      "Strong directional trend with sustained price strength.",
      [...items].filter((item) => item.momentumScore >= 72).sort((a, b) => b.momentumScore - a.momentumScore)
    ),
    panel(
      "Oversold Stocks",
      "Potential rebound setups with depressed RSI regimes.",
      [...items].filter((item) => item.technicalSignals.rsi <= 35).sort((a, b) => a.technicalSignals.rsi - b.technicalSignals.rsi)
    ),
    panel(
      "Overbought Stocks",
      "Extended moves where pullback risk is elevated.",
      [...items].filter((item) => item.technicalSignals.rsi >= 70).sort((a, b) => b.technicalSignals.rsi - a.technicalSignals.rsi)
    ),
    panel(
      "Breakout Candidates",
      "Price near resistance with positive momentum + trend continuation.",
      [...items]
        .filter((item) => item.trendContinuationProbability >= 65 && item.price >= item.resistanceZone * 0.97)
        .sort((a, b) => b.trendContinuationProbability - a.trendContinuationProbability)
    ),
    panel(
      "Reversal Signals",
      "Divergence zones where sentiment and momentum are out of sync.",
      [...items]
        .filter((item) => (item.sentiment === "bearish" && item.momentumScore > 60) || (item.sentiment === "bullish" && item.momentumScore < 40))
        .sort((a, b) => Math.abs(50 - b.momentumScore) - Math.abs(50 - a.momentumScore))
    ),
    panel(
      "Unusual Volume Activity",
      "Volume regimes that can precede sharp directional moves.",
      [...items].filter((item) => item.anomalyFlags.includes("volume")).sort((a, b) => b.volume - a.volume)
    ),
  ];
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

    const inflight = inflightSnapshots.get(cacheKey);
    if (inflight) {
      return inflight;
    }
  }

  const snapshotPromise = (async () => {
    const providerResult = await fetchProviderQuotes(symbols, timeframe);

    const items = providerResult.quotes
      .map((quote) => toStockItem(quote, providerResult.isLive))
      .sort((a, b) => b.momentumScore - a.momentumScore);

    const alerts = buildAlerts(items);
    const topMovers = [...items].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 6);

    const screenerTimeframe = mapToCardTimeframe(timeframe);
    const screeners = buildScreeners(items, screenerTimeframe);
    const smartPanels = buildSmartPanels(items);

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
        score: clamp(alerts.length * 12, 0, 100),
        detail: "Aggregate intensity from active downside, volume, and volatility signals.",
      },
    ];

    const snapshot: WatchlistSnapshot = {
      timeframe,
      source: providerResult.source,
      isLive: providerResult.isLive,
      fallbackUsed: providerResult.fallbackUsed,
      fallbackReason: providerResult.fallbackReason,
      stale: !providerResult.isLive,
      staleReason: providerResult.isLive ? undefined : providerResult.fallbackReason,
      providerHealth: providerResult.providerHealth,
      updatedAt: new Date().toISOString(),
      items,
      alerts,
      topMovers,
      screenerTimeframe,
      screeners,
      smartPanels,
      riskSignals,
      pollIntervalSeconds: Math.max(10, POLL_INTERVAL_SECONDS),
    };

    watchlistCache.set(cacheKey, {
      expiresAt: now + ttlMs,
      value: snapshot,
    });

    return snapshot;
  })();

  if (!params.forceRefresh) {
    inflightSnapshots.set(cacheKey, snapshotPromise);
  }

  try {
    return await snapshotPromise;
  } finally {
    inflightSnapshots.delete(cacheKey);
  }
}

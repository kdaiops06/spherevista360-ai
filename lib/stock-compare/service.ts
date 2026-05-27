import { WATCHLIST_PROVIDER_ORDER } from "@/lib/watchlist-ai/providers";
import type { ProviderHealthStatus, RawProviderQuote } from "@/lib/watchlist-ai/types";
import type {
  ComparisonHorizon,
  ComparisonSnapshot,
  ComparisonStock,
  ComparisonReturns,
  ComparisonAiOutlook,
} from "@/lib/stock-compare/types";

const DEFAULT_SYMBOLS = ["NVDA", "AMD", "INTC"];
const MAX_SYMBOLS = 6;
const CACHE_TTL_SECONDS = 45;

const cache = new Map<string, { value: ComparisonSnapshot; expiresAt: number }>();

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSymbols(symbols?: string[]): string[] {
  const cleaned = (symbols || DEFAULT_SYMBOLS)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const unique = Array.from(new Set(cleaned));
  return unique.slice(0, MAX_SYMBOLS);
}

function cacheKey(symbols: string[], horizon: ComparisonHorizon): string {
  return `${horizon}:${symbols.join(",")}`;
}

function inferTrend(series: number[]): "bullish" | "bearish" | "neutral" {
  if (series.length < 2) {
    return "neutral";
  }
  const first = series[0];
  const last = series[series.length - 1];
  const change = ((last - first) / Math.max(first, 0.01)) * 100;
  if (change > 1.2) {
    return "bullish";
  }
  if (change < -1.2) {
    return "bearish";
  }
  return "neutral";
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

function rsi(series: number[], period = 14): number {
  if (series.length <= period) {
    return 50;
  }
  let gains = 0;
  let losses = 0;
  for (let i = series.length - period; i < series.length; i += 1) {
    const prev = series[i - 1];
    const next = series[i];
    const d = next - prev;
    if (d >= 0) {
      gains += d;
    } else {
      losses += Math.abs(d);
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

function volatility(series: number[]): number {
  if (series.length < 2) {
    return 15;
  }
  const highs = Math.max(...series);
  const lows = Math.min(...series);
  const vol = ((highs - lows) / Math.max(lows, 0.01)) * 100;
  return clamp(Math.round(vol * 3.8), 5, 100);
}

function returnsFromSeries(series: number[]): ComparisonReturns {
  const calc = (days: number): number | null => {
    if (series.length < days + 1) {
      return null;
    }
    const from = series[series.length - (days + 1)];
    const to = series[series.length - 1];
    if (from <= 0) {
      return null;
    }
    return Number((((to - from) / from) * 100).toFixed(2));
  };

  const longFrom = series[0];
  const longTo = series[series.length - 1];
  const longReturn = longFrom > 0 ? Number((((longTo - longFrom) / longFrom) * 100).toFixed(2)) : null;

  return {
    "1W": calc(7),
    "1M": calc(30),
    "3M": calc(90),
    "6M": calc(180),
    "1Y": calc(365),
    "3Y": calc(1095),
    LONG: longReturn,
  };
}

function toDailyFromTimeframe(raw: RawProviderQuote): number[] {
  if (raw.dailySeries && raw.dailySeries.length > 4) {
    return raw.dailySeries;
  }
  const from3m = raw.timeframeSeries?.["3M"] || raw.series || [];
  if (from3m.length > 2) {
    return from3m;
  }
  return [];
}

async function fetchLongHistory(symbol: string, horizon: ComparisonHorizon): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const dayMap: Record<ComparisonHorizon, number> = {
    "1W": 10,
    "1M": 40,
    "3M": 120,
    "6M": 220,
    "1Y": 420,
    "3Y": 1150,
    LONG: 1825,
  };
  const days = dayMap[horizon];

  if (process.env.FINNHUB_API_KEY) {
    try {
      const from = now - days * 86_400;
      const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${process.env.FINNHUB_API_KEY}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as { c?: number[] };
        const series = (json.c || []).filter((v) => Number.isFinite(v) && v > 0);
        if (series.length > 20) {
          return series;
        }
      }
    } catch {
      // fall through
    }
  }

  if (process.env.TWELVEDATA_API_KEY) {
    try {
      const outputSize = clamp(days, 60, 1500);
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=${outputSize}&apikey=${process.env.TWELVEDATA_API_KEY}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as { values?: Array<{ close?: string }> };
        const series = (json.values || []).map((v) => Number(v.close || 0)).filter((v) => v > 0).reverse();
        if (series.length > 20) {
          return series;
        }
      }
    } catch {
      // fall through
    }
  }

  if (process.env.POLYGON_API_KEY) {
    try {
      const to = new Date();
      const from = new Date(to.getTime() - days * 86_400_000);
      const url = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${from
        .toISOString()
        .slice(0, 10)}/${to.toISOString().slice(0, 10)}?adjusted=true&sort=asc&limit=5000&apiKey=${process.env.POLYGON_API_KEY}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as { results?: Array<{ c: number }> };
        const series = (json.results || []).map((r) => Number(r.c || 0)).filter((v) => v > 0);
        if (series.length > 20) {
          return series;
        }
      }
    } catch {
      // fall through
    }
  }

  if (process.env.ALPHA_VANTAGE_API_KEY) {
    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as { "Time Series (Daily)"?: Record<string, { "4. close"?: string }> };
        const series = Object.entries(json["Time Series (Daily)"] || {})
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([, v]) => Number(v["4. close"] || 0))
          .filter((v) => v > 0);
        if (series.length > 20) {
          return series;
        }
      }
    } catch {
      // fall through
    }
  }

  return [];
}

function aiSummary(item: ComparisonStock, horizon: ComparisonHorizon): string {
  const h = item.ai.suitabilityByHorizon[horizon];
  if (h >= 70) {
    return `${item.ticker} shows strong ${horizon} setup with ${item.ai.growthProbability}% growth probability.`;
  }
  if (h <= 40) {
    return `${item.ticker} has weak ${horizon} profile with elevated downside risk.`;
  }
  return `${item.ticker} is balanced on ${horizon}; wait for clearer momentum confirmation.`;
}

function buildSuitability(baseGrowth: number, baseRisk: number): Record<ComparisonHorizon, number> {
  return {
    "1W": clamp(Math.round(baseGrowth * 0.85 - baseRisk * 0.45 + 42), 5, 95),
    "1M": clamp(Math.round(baseGrowth * 0.9 - baseRisk * 0.4 + 45), 5, 95),
    "3M": clamp(Math.round(baseGrowth * 0.95 - baseRisk * 0.35 + 46), 5, 95),
    "6M": clamp(Math.round(baseGrowth - baseRisk * 0.3 + 48), 5, 95),
    "1Y": clamp(Math.round(baseGrowth * 1.02 - baseRisk * 0.25 + 48), 5, 95),
    "3Y": clamp(Math.round(baseGrowth * 1.08 - baseRisk * 0.2 + 50), 5, 95),
    LONG: clamp(Math.round(baseGrowth * 1.12 - baseRisk * 0.15 + 52), 5, 95),
  };
}

function rankPercentile(value: number, values: number[]): number {
  if (values.length <= 1) {
    return 50;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex((v) => value <= v);
  const pos = idx === -1 ? sorted.length - 1 : idx;
  return Math.round((pos / (sorted.length - 1)) * 100);
}

async function fetchBaseQuotes(symbols: string[]) {
  const providerHealth: ProviderHealthStatus[] = WATCHLIST_PROVIDER_ORDER.map((provider) => ({
    provider: provider.name,
    configured: provider.isConfigured(),
    ok: false,
  }));

  for (const provider of WATCHLIST_PROVIDER_ORDER) {
    const providerEntry = providerHealth.find((entry) => entry.provider === provider.name);
    if (!provider.isConfigured()) {
      if (providerEntry) {
        providerEntry.error = "not_configured";
      }
      continue;
    }
    try {
      const start = Date.now();
      const quotes = await provider.fetchQuotes({ symbols, timeframe: "1Y" });
      if (quotes.length > 0) {
        if (providerEntry) {
          providerEntry.ok = true;
          providerEntry.latencyMs = Date.now() - start;
          providerEntry.lastSuccessAt = new Date().toISOString();
        }
        return { quotes, source: provider.name, isLive: true, providerHealth, staleReason: undefined };
      }
      if (providerEntry) {
        providerEntry.error = "empty_response";
      }
    } catch {
      if (providerEntry) {
        providerEntry.error = "provider_error";
      }
      // try next provider
    }
  }

  return {
    quotes: [] as RawProviderQuote[],
    source: "No provider available",
    isLive: false,
    providerHealth,
    staleReason: "No realtime provider returned valid quote data.",
  };
}

export async function getStockComparisonSnapshot(params: {
  symbols?: string[];
  horizon?: ComparisonHorizon;
  forceRefresh?: boolean;
}): Promise<ComparisonSnapshot> {
  const symbols = normalizeSymbols(params.symbols);
  const horizon = params.horizon || "1Y";
  const key = cacheKey(symbols, horizon);
  const now = Date.now();

  if (!params.forceRefresh) {
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
  }

  const base = await fetchBaseQuotes(symbols);

  const longSeriesBySymbol = await Promise.all(
    base.quotes.map(async (quote) => {
      const longSeries = await fetchLongHistory(quote.ticker, horizon);
      return {
        ticker: quote.ticker,
        series: longSeries.length > 12 ? longSeries : toDailyFromTimeframe(quote),
      };
    })
  );

  const mapLong = new Map(longSeriesBySymbol.map((entry) => [entry.ticker, entry.series]));

  const items = base.quotes
    .map((raw): ComparisonStock | null => {
      const longSeries = mapLong.get(raw.ticker) || toDailyFromTimeframe(raw);
      if (longSeries.length < 2) {
        return null;
      }
    const priceSeries = {
      "1D": raw.timeframeSeries?.["1D"] || raw.series || longSeries.slice(-40),
      "1W": raw.timeframeSeries?.["1W"] || longSeries.slice(-7),
      "1M": raw.timeframeSeries?.["1M"] || longSeries.slice(-22),
      "3M": raw.timeframeSeries?.["3M"] || longSeries.slice(-66),
    };

    const returns = returnsFromSeries(longSeries);
    const vol = volatility(longSeries);
    const mom = clamp(Math.round((returns["3M"] || raw.changePercent || 0) * 2.8 + 50), 0, 100);
    const rs = clamp(Math.round((returns["1Y"] || returns["3M"] || 0) * 2 + 50), 0, 100);
    const rsIndex = rsi(longSeries);
    const ema12 = ema(longSeries, 12);
    const ema26 = ema(longSeries, 26);
    const macdTrend = ema12 != null && ema26 != null ? (ema12 > ema26 ? "bullish" : ema12 < ema26 ? "bearish" : "neutral") : "neutral";

    const f = raw.fundamentals || {};
    const pe = f.peRatio ?? null;
    const revGrowth = f.revenueGrowth ?? null;
    const debt = f.debtToEquity ?? null;
    const roe = f.roe ?? null;

    const fairValueEstimate = pe != null && f.eps != null ? Number((pe * f.eps).toFixed(2)) : null;
    const growthPremium = revGrowth != null && pe != null ? Number((pe - revGrowth).toFixed(2)) : null;

    const undervaluedScore = clamp(
      Math.round(55 + (revGrowth != null ? revGrowth * 0.35 : 0) - (pe != null ? pe * 0.45 : 0) - (debt != null ? debt * 4 : 0)),
      0,
      100
    );

    const riskScore = clamp(Math.round(vol * 0.45 + (debt != null ? debt * 10 : 24) + (f.beta != null ? f.beta * 20 : 18)), 0, 100);
    const growthProbability = clamp(Math.round(45 + mom * 0.35 + (revGrowth != null ? revGrowth * 1.2 : 0) + (roe != null ? roe * 0.45 : 0)), 5, 95);
    const riskProbability = clamp(Math.round(riskScore * 0.75 + (vol > 70 ? 10 : 0)), 5, 95);

    const suitability = buildSuitability(growthProbability, riskProbability);
    const outlook: ComparisonAiOutlook["outlook"] = growthProbability > riskProbability + 8 ? "bullish" : riskProbability > growthProbability + 8 ? "bearish" : "neutral";

    const highlights: string[] = [];
    if (revGrowth != null && revGrowth > 12) {
      highlights.push("Strong long-term growth potential based on revenue acceleration");
    }
    if (pe != null && pe > 45) {
      highlights.push("Valuation stretched despite momentum");
    }
    if (debt != null && debt > 1.5) {
      highlights.push("High debt weakens long-term stability");
    }
    if (f.dividendYield != null && f.dividendYield > 2.5) {
      highlights.push("Dividend support can cushion drawdown risk");
    }
    if (macdTrend === "bearish" && mom > 60) {
      highlights.push("Momentum weakening after breakout phase");
    }
    if (undervaluedScore >= 70) {
      highlights.push("Undervalued versus growth and balance-sheet profile");
    }

    const leadership = clamp(Math.round(mom * 0.5 + rs * 0.3 + growthProbability * 0.2), 0, 100);
    const financialHealth = clamp(Math.round((roe ?? 12) * 2 + (debt != null ? (2 - debt) * 20 : 18) + (f.operatingMargin ?? 10) * 1.3), 0, 100);
    const earningsMomentum = clamp(Math.round((revGrowth ?? 8) * 2.8 + (f.eps ?? 2) * 4), 0, 100);
    const institutionalConfidence = clamp(Math.round(leadership * 0.4 + financialHealth * 0.35 + (100 - riskScore) * 0.25), 0, 100);

    return {
      ticker: raw.ticker,
      companyName: raw.companyName || raw.ticker,
      sector: raw.sector || "Unknown",
      price: Number(raw.price.toFixed(2)),
      dayChangePercent: Number(raw.changePercent.toFixed(2)),
      volume: raw.volume,
      marketCap: raw.marketCap ?? null,
      priceSeries,
      longSeries,
      returns,
      technical: {
        volatility: vol,
        momentum: mom,
        relativeStrength: rs,
        rsi: rsIndex,
        macdTrend,
        movingAverage20: sma(longSeries, 20),
        movingAverage50: sma(longSeries, 50),
      },
      fundamentals: {
        peRatio: pe,
        forwardPe: f.forwardPe ?? null,
        pbRatio: f.pbRatio ?? null,
        pegRatio: pe != null && revGrowth != null && revGrowth !== 0 ? Number((pe / revGrowth).toFixed(2)) : null,
        debtToEquity: debt,
        eps: f.eps ?? null,
        revenue: f.revenue ?? null,
        revenueGrowth: revGrowth,
        profitMargin: f.operatingMargin ?? null,
        operatingMargin: f.operatingMargin ?? null,
        roe,
        roce: f.roce ?? null,
        freeCashFlow: f.freeCashFlow ?? null,
        dividendYield: f.dividendYield ?? null,
        beta: f.beta ?? null,
        marketCap: raw.marketCap ?? null,
      },
      valuation: {
        aiUndervaluedScore: undervaluedScore,
        fairValueEstimate,
        growthPremium,
        valuationConfidence: clamp(Math.round(50 + (f.peRatio != null ? 15 : -5) + (f.revenueGrowth != null ? 20 : -5)), 20, 95),
        label: undervaluedScore >= 66 ? "undervalued" : undervaluedScore <= 38 ? "overvalued" : "fair",
      },
      risk: {
        volatilityRisk: clamp(Math.round(vol * 0.9), 0, 100),
        debtRisk: clamp(Math.round((debt ?? 1.1) * 35), 0, 100),
        macroSensitivity: clamp(Math.round((f.beta ?? 1.05) * 42), 0, 100),
        recessionSensitivity: clamp(Math.round((f.beta ?? 1.0) * 35 + (debt ?? 1.0) * 15), 0, 100),
        aiRiskScore: riskScore,
      },
      ai: {
        confidence: clamp(Math.round(55 + Math.abs(growthProbability - riskProbability) * 0.5), 45, 97),
        growthProbability,
        riskProbability,
        outlook,
        suitabilityByHorizon: suitability,
        summary: "",
        highlights,
      },
      leadershipScore: leadership,
      financialHealthScore: financialHealth,
      earningsMomentumScore: earningsMomentum,
      institutionalConfidence,
      percentileRank: 0,
      raw,
    };
    })
    .filter((item): item is ComparisonStock => item !== null);

  const leadershipValues = items.map((i) => i.leadershipScore);
  const finalItems = items.map((item) => {
    const percentileRank = rankPercentile(item.leadershipScore, leadershipValues);
    return {
      ...item,
      percentileRank,
      ai: {
        ...item.ai,
        summary: aiSummary(item, horizon),
      },
    };
  });

  const sortDesc = (fn: (i: ComparisonStock) => number) => [...finalItems].sort((a, b) => fn(b) - fn(a));
  const sortAsc = (fn: (i: ComparisonStock) => number) => [...finalItems].sort((a, b) => fn(a) - fn(b));

  const rankings = {
    growthPotential: sortDesc((i) => i.ai.growthProbability),
    valuation: sortDesc((i) => i.valuation.aiUndervaluedScore),
    riskReward: sortDesc((i) => i.ai.growthProbability - i.risk.aiRiskScore),
    aiBullish: sortDesc((i) => i.ai.suitabilityByHorizon[horizon]),
    sectorLeadership: sortDesc((i) => i.leadershipScore),
    institutionalConfidence: sortDesc((i) => i.institutionalConfidence),
    earningsMomentum: sortDesc((i) => i.earningsMomentumScore),
    financialHealth: sortDesc((i) => i.financialHealthScore),
  };

  const bestShort = rankings.aiBullish[0];
  const bestMedium = rankings.riskReward[0];
  const bestLong = sortDesc((i) => i.ai.suitabilityByHorizon.LONG)[0];
  const riskiest = sortDesc((i) => i.risk.aiRiskScore)[0];

  const snapshot: ComparisonSnapshot = {
    horizon,
    symbols,
    source: base.source,
    isLive: base.isLive,
    stale: !base.isLive,
    staleReason: base.staleReason,
    providerHealth: base.providerHealth,
    updatedAt: new Date().toISOString(),
    items: finalItems,
    rankings,
    recommendations: {
      shortTerm: bestShort
        ? `${bestShort.ticker} shows strongest momentum for short horizon with ${bestShort.ai.suitabilityByHorizon["1M"]}% suitability.`
        : "No short-term recommendation available.",
      mediumTerm: bestMedium
        ? `${bestMedium.ticker} offers best risk-adjusted setup for 6-month horizon in current peer set.`
        : "No medium-term recommendation available.",
      longTerm: bestLong
        ? `${bestLong.ticker} ranks highest for long-term investment suitability with strong structural profile.`
        : "No long-term recommendation available.",
      riskWarning: riskiest
        ? `${riskiest.ticker} has elevated risk profile (${riskiest.risk.aiRiskScore}/100) despite current momentum.`
        : "No risk warning available.",
    },
  };

  cache.set(key, {
    value: snapshot,
    expiresAt: now + CACHE_TTL_SECONDS * 1000,
  });

  return snapshot;
}

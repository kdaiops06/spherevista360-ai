export type WatchlistTimeframe = "1D" | "1W" | "1M" | "3M" | "1Y";

export type CardTimeframe = "1D" | "1W" | "1M" | "3M";

export type AlertType =
  | "price-drop"
  | "volatility-spike"
  | "volume-spike"
  | "momentum-divergence"
  | "unusual-trading";

export type AlertSeverity = "info" | "warning" | "critical";

export interface TimeframeInsight {
  timeframe: CardTimeframe;
  changePercent: number;
  trendDirection: "up" | "down" | "flat";
  volatilityScore: number;
  series: number[];
}

export interface StockFundamentals {
  peRatio: number | null;
  forwardPe: number | null;
  pbRatio: number | null;
  pegRatio: number | null;
  debtToEquity: number | null;
  eps: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  operatingMargin: number | null;
  roe: number | null;
  roce: number | null;
  freeCashFlow: number | null;
  dividendYield: number | null;
  beta: number | null;
}

export interface ProviderHealthStatus {
  provider: string;
  configured: boolean;
  ok: boolean;
  status?: "healthy" | "degraded" | "invalid-key" | "rate-limited" | "unavailable";
  reachable?: boolean;
  stale?: boolean;
  staleMs?: number;
  latencyMs?: number;
  error?: string;
  lastSuccessAt?: string;
  retryCount?: number;
  failureCount?: number;
  quotaRemaining?: number;
  quotaLimit?: number;
  websocketConnected?: boolean;
}

export interface ProviderDiagnosticsReport {
  generatedAt: string;
  overallStatus: "healthy" | "degraded" | "invalid-key" | "rate-limited" | "unavailable";
  websocket: {
    connected: boolean;
    reconnectAttempts: number;
    subscribedSymbols: number;
    lastConnectedAt?: string;
    lastMessageAt?: string;
    lastReconnectAt?: string;
    lastError?: string;
  };
  providers: Array<{
    provider: string;
    configured: boolean;
    keyPresent: boolean;
    status: "healthy" | "degraded" | "invalid-key" | "rate-limited" | "unavailable";
    reachable: boolean;
    latencyMs?: number;
    quotaRemaining?: number;
    quotaLimit?: number;
    websocketConnected?: boolean;
    websocketError?: string;
    stale: boolean;
    staleMs?: number;
    lastSuccessfulFetch?: string;
    lastFailureAt?: string;
    retryCount: number;
    failureCount: number;
    error?: string;
    messages: string[];
    checkedAt: string;
  }>;
}

export interface TechnicalSignals {
  rsi: number;
  macdTrend: "bullish" | "bearish" | "neutral";
  sma20: number | null;
  sma50: number | null;
}

export interface WatchlistStockItem {
  ticker: string;
  companyName: string;
  sector: string;
  assetType: "stock" | "etf" | "crypto";
  price: number;
  changePercent: number;
  marketCap: number | null;
  volume: number;
  dayHigh: number;
  dayLow: number;
  volatilityScore: number;
  momentumScore: number;
  rsiScore: number;
  relativeStrength: number;
  supportZone: number;
  resistanceZone: number;
  priceRangePosition: number;
  miniSeries: number[];
  timeframeInsights: Record<CardTimeframe, TimeframeInsight>;
  sentiment: "bullish" | "bearish" | "neutral";
  trendDirection: "up" | "down" | "flat";
  realtimeUpdated: boolean;
  aiAnalysis: string;
  bullishLabel: "bullish" | "bearish";
  aiConfidence: number;
  bullishProbability: number;
  bearishProbability: number;
  trendContinuationProbability: number;
  accumulationSignal: "accumulation" | "distribution" | "neutral";
  technicalSignals: TechnicalSignals;
  fundamentals: StockFundamentals;
  anomalyFlags: string[];
  updatedAt: string;
}

export interface WatchlistScreenerPanel {
  title: string;
  description: string;
  items: WatchlistStockItem[];
}

export interface WatchlistAlert {
  id: string;
  ticker: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
}

export interface WatchlistSnapshot {
  timeframe: WatchlistTimeframe;
  source: string;
  isLive: boolean;
  fallbackUsed: boolean;
  fallbackReason?: string;
  stale: boolean;
  staleReason?: string;
  providerHealth: ProviderHealthStatus[];
  updatedAt: string;
  items: WatchlistStockItem[];
  alerts: WatchlistAlert[];
  topMovers: WatchlistStockItem[];
  screenerTimeframe: CardTimeframe;
  screeners: {
    biggestGainers: WatchlistStockItem[];
    biggestLosers: WatchlistStockItem[];
    highMomentum: WatchlistStockItem[];
    highVolatility: WatchlistStockItem[];
    aiBullishPicks: WatchlistStockItem[];
    aiBearishWarnings: WatchlistStockItem[];
  };
  smartPanels: WatchlistScreenerPanel[];
  riskSignals: Array<{
    label: string;
    score: number;
    detail: string;
  }>;
  pollIntervalSeconds: number;
}

export interface RawProviderQuote {
  ticker: string;
  price: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  series?: number[];
  dailySeries?: number[];
  timeframeSeries?: Partial<Record<CardTimeframe, number[]>>;
  marketCap?: number | null;
  companyName?: string;
  sector?: string;
  fundamentals?: Partial<StockFundamentals>;
}

export interface ProviderFetchContext {
  timeframe: WatchlistTimeframe;
  symbols: string[];
}

export interface ProviderClient {
  name: string;
  isConfigured(): boolean;
  fetchQuotes(context: ProviderFetchContext): Promise<RawProviderQuote[]>;
}

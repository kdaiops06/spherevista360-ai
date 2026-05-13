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
  anomalyFlags: string[];
  updatedAt: string;
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
  updatedAt: string;
  items: WatchlistStockItem[];
  alerts: WatchlistAlert[];
  topMovers: WatchlistStockItem[];
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
  marketCap?: number | null;
  companyName?: string;
  sector?: string;
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

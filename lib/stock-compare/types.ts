import type { RawProviderQuote } from "@/lib/watchlist-ai/types";
import type { ProviderHealthStatus } from "@/lib/watchlist-ai/types";

export type ComparisonHorizon = "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "LONG";

export interface ComparisonFilters {
  growthStocks?: boolean;
  valueStocks?: boolean;
  aiSector?: boolean;
  lowDebt?: boolean;
  highRoe?: boolean;
  undervalued?: boolean;
  highMomentum?: boolean;
  lowVolatility?: boolean;
  strongCashFlow?: boolean;
}

export interface ComparisonValuation {
  aiUndervaluedScore: number;
  fairValueEstimate: number | null;
  growthPremium: number | null;
  valuationConfidence: number;
  label: "undervalued" | "fair" | "overvalued";
}

export interface ComparisonRisk {
  volatilityRisk: number;
  debtRisk: number;
  macroSensitivity: number;
  recessionSensitivity: number;
  aiRiskScore: number;
}

export interface ComparisonAiOutlook {
  confidence: number;
  growthProbability: number;
  riskProbability: number;
  outlook: "bullish" | "neutral" | "bearish";
  suitabilityByHorizon: Record<ComparisonHorizon, number>;
  summary: string;
  highlights: string[];
}

export interface ComparisonTechnical {
  volatility: number;
  momentum: number;
  relativeStrength: number;
  rsi: number;
  macdTrend: "bullish" | "bearish" | "neutral";
  movingAverage20: number | null;
  movingAverage50: number | null;
}

export interface ComparisonFundamentals {
  peRatio: number | null;
  forwardPe: number | null;
  pbRatio: number | null;
  pegRatio: number | null;
  debtToEquity: number | null;
  eps: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  roe: number | null;
  roce: number | null;
  freeCashFlow: number | null;
  dividendYield: number | null;
  beta: number | null;
  marketCap: number | null;
}

export interface ComparisonReturns {
  "1W": number | null;
  "1M": number | null;
  "3M": number | null;
  "6M": number | null;
  "1Y": number | null;
  "3Y": number | null;
  LONG: number | null;
}

export interface ComparisonStock {
  ticker: string;
  companyName: string;
  sector: string;
  price: number;
  dayChangePercent: number;
  volume: number;
  marketCap: number | null;
  priceSeries: {
    "1D": number[];
    "1W": number[];
    "1M": number[];
    "3M": number[];
  };
  longSeries: number[];
  returns: ComparisonReturns;
  technical: ComparisonTechnical;
  fundamentals: ComparisonFundamentals;
  valuation: ComparisonValuation;
  risk: ComparisonRisk;
  ai: ComparisonAiOutlook;
  leadershipScore: number;
  financialHealthScore: number;
  earningsMomentumScore: number;
  institutionalConfidence: number;
  percentileRank: number;
  raw: RawProviderQuote;
}

export interface ComparisonSnapshot {
  horizon: ComparisonHorizon;
  symbols: string[];
  source: string;
  isLive: boolean;
  stale: boolean;
  staleReason?: string;
  providerHealth: ProviderHealthStatus[];
  updatedAt: string;
  items: ComparisonStock[];
  rankings: {
    growthPotential: ComparisonStock[];
    valuation: ComparisonStock[];
    riskReward: ComparisonStock[];
    aiBullish: ComparisonStock[];
    sectorLeadership: ComparisonStock[];
    institutionalConfidence: ComparisonStock[];
    earningsMomentum: ComparisonStock[];
    financialHealth: ComparisonStock[];
  };
  recommendations: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
    riskWarning: string;
  };
}

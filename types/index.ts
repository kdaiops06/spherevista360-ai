// Core types for SphereVista360

export interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: "finance" | "macro" | "currencies";
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  author: string;
  readingTime: number;
  featured: boolean;
  seo: SEOMeta;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  schema?: Record<string, unknown>;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  lastUpdated: string;
}

export interface CurrencyRate {
  base: string;
  target: string;
  rate: number;
  lastUpdated: string;
}

export interface CurrencyStrength {
  currency: string;
  strength: number;
  change24h: number;
  trend: "up" | "down" | "stable";
}

export interface EconomicIndicator {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  date: string;
  source: string;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface AIPrediction {
  asset: string;
  prediction: "bullish" | "bearish" | "neutral";
  confidence: number;
  timeframe: string;
  reasoning: string;
  generatedAt: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  model: "claude" | "openai";
  schedule?: string;
  enabled: boolean;
}

export interface ToolCalculation {
  type: "currency" | "inflation" | "compound-interest" | "purchasing-power";
  inputs: Record<string, number | string>;
  result: number;
  metadata?: Record<string, unknown>;
}

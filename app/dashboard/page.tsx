import type { Metadata } from "next";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { CurrencyStrengthCard } from "@/components/dashboard/CurrencyStrengthCard";
import { PredictionsCard } from "@/components/dashboard/PredictionsCard";
import { LatestNewsCard } from "@/components/dashboard/LatestNewsCard";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import type { MarketData, CurrencyStrength, AIPrediction, NewsItem } from "@/types";

export const metadata: Metadata = {
  title: "Financial Dashboard",
  description:
    "Real-time financial dashboard with market overview, currency strength, AI predictions, and latest news.",
};

// Demo data - these would come from live APIs/Supabase in production
const marketData: MarketData[] = [
  { symbol: "SPY", name: "S&P 500 ETF", price: 5842.15, change: 23.4, changePercent: 0.42, lastUpdated: new Date().toISOString() },
  { symbol: "DIA", name: "Dow Jones ETF", price: 43215.80, change: -45.2, changePercent: -0.10, lastUpdated: new Date().toISOString() },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 20124.50, change: 98.7, changePercent: 0.49, lastUpdated: new Date().toISOString() },
  { symbol: "GLD", name: "Gold ETF", price: 2952.30, change: 12.1, changePercent: 0.41, lastUpdated: new Date().toISOString() },
  { symbol: "BTC-USD", name: "Bitcoin", price: 87420.00, change: -1205.0, changePercent: -1.36, lastUpdated: new Date().toISOString() },
  { symbol: "TLT", name: "20Y Treasury ETF", price: 88.45, change: -0.35, changePercent: -0.39, lastUpdated: new Date().toISOString() },
];

const currencyStrength: CurrencyStrength[] = [
  { currency: "USD", strength: 72, change24h: 0.3, trend: "up" },
  { currency: "EUR", strength: 55, change24h: -0.2, trend: "down" },
  { currency: "GBP", strength: 60, change24h: 0.1, trend: "up" },
  { currency: "JPY", strength: 35, change24h: -0.8, trend: "down" },
  { currency: "CHF", strength: 68, change24h: 0.5, trend: "up" },
  { currency: "AUD", strength: 45, change24h: -0.4, trend: "down" },
];

const predictions: AIPrediction[] = [
  { asset: "S&P 500", prediction: "bullish", confidence: 0.72, timeframe: "1 month", reasoning: "Earnings momentum and stable rates support continued upside.", generatedAt: new Date().toISOString() },
  { asset: "Gold", prediction: "bullish", confidence: 0.65, timeframe: "3 months", reasoning: "Geopolitical uncertainty and inflation hedging driving demand.", generatedAt: new Date().toISOString() },
  { asset: "EUR/USD", prediction: "neutral", confidence: 0.55, timeframe: "1 week", reasoning: "Policy convergence limits directional moves.", generatedAt: new Date().toISOString() },
  { asset: "Bitcoin", prediction: "bullish", confidence: 0.60, timeframe: "1 month", reasoning: "Institutional adoption and halving cycle dynamics.", generatedAt: new Date().toISOString() },
];

const latestNews: NewsItem[] = [
  { title: "Fed Signals Patience on Rate Cuts Amid Sticky Inflation", description: "", url: "#", source: "Reuters", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "Tech Stocks Rally as AI Spending Accelerates", description: "", url: "#", source: "Bloomberg", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "Oil Prices Surge on Middle East Supply Concerns", description: "", url: "#", source: "CNBC", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "ECB Holds Rates Steady, Eyes June for Next Move", description: "", url: "#", source: "Financial Times", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "Housing Market Shows Signs of Recovery in Spring Season", description: "", url: "#", source: "WSJ", publishedAt: new Date().toISOString(), category: "finance" },
];

export default function DashboardPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Financial Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Real-time market overview and AI-powered insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MarketOverview data={marketData} />
          <LatestNewsCard news={latestNews} />
        </div>
        <div className="space-y-6">
          <CurrencyStrengthCard data={currencyStrength} />
          <PredictionsCard predictions={predictions} />
          <ToolsGrid />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  TrendingUp,
  Globe,
  Brain,
  Wrench,
  ArrowRight,
  Newspaper,
  BarChart3,
  Shield,
} from "lucide-react";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { CurrencyStrengthCard } from "@/components/dashboard/CurrencyStrengthCard";
import { PredictionsCard } from "@/components/dashboard/PredictionsCard";
import { LatestNewsCard } from "@/components/dashboard/LatestNewsCard";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import { NewsletterSignup } from "@/components/monetization/NewsletterSignup";
import type { MarketData, CurrencyStrength, AIPrediction, NewsItem } from "@/types";

// Demo data for initial render - replaced by live data once APIs are configured
const demoMarketData: MarketData[] = [
  { symbol: "SPY", name: "S&P 500 ETF", price: 5842.15, change: 23.4, changePercent: 0.42, lastUpdated: new Date().toISOString() },
  { symbol: "DIA", name: "Dow Jones ETF", price: 43215.80, change: -45.2, changePercent: -0.10, lastUpdated: new Date().toISOString() },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 20124.50, change: 98.7, changePercent: 0.49, lastUpdated: new Date().toISOString() },
  { symbol: "GLD", name: "Gold ETF", price: 2952.30, change: 12.1, changePercent: 0.41, lastUpdated: new Date().toISOString() },
  { symbol: "BTC-USD", name: "Bitcoin", price: 87420.00, change: -1205.0, changePercent: -1.36, lastUpdated: new Date().toISOString() },
];

const demoCurrencyStrength: CurrencyStrength[] = [
  { currency: "USD", strength: 72, change24h: 0.3, trend: "up" },
  { currency: "EUR", strength: 55, change24h: -0.2, trend: "down" },
  { currency: "GBP", strength: 60, change24h: 0.1, trend: "up" },
  { currency: "JPY", strength: 35, change24h: -0.8, trend: "down" },
  { currency: "CHF", strength: 68, change24h: 0.5, trend: "up" },
  { currency: "AUD", strength: 45, change24h: -0.4, trend: "down" },
];

const demoPredictions: AIPrediction[] = [
  { asset: "S&P 500", prediction: "bullish", confidence: 0.72, timeframe: "1 month", reasoning: "Earnings momentum and stable rates support continued upside.", generatedAt: new Date().toISOString() },
  { asset: "Gold", prediction: "bullish", confidence: 0.65, timeframe: "3 months", reasoning: "Geopolitical uncertainty and inflation hedging driving demand.", generatedAt: new Date().toISOString() },
  { asset: "EUR/USD", prediction: "neutral", confidence: 0.55, timeframe: "1 week", reasoning: "ECB and Fed policy convergence limits directional moves.", generatedAt: new Date().toISOString() },
  { asset: "Bitcoin", prediction: "bullish", confidence: 0.60, timeframe: "1 month", reasoning: "Institutional adoption and halving cycle support price.", generatedAt: new Date().toISOString() },
];

const demoNews: NewsItem[] = [
  { title: "Fed Signals Patience on Rate Cuts Amid Sticky Inflation", description: "", url: "#", source: "Reuters", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "Tech Stocks Rally as AI Spending Accelerates", description: "", url: "#", source: "Bloomberg", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "Oil Prices Surge on Middle East Supply Concerns", description: "", url: "#", source: "CNBC", publishedAt: new Date().toISOString(), category: "finance" },
  { title: "ECB Holds Rates Steady, Eyes June for Next Move", description: "", url: "#", source: "Financial Times", publishedAt: new Date().toISOString(), category: "finance" },
];

const features = [
  {
    icon: Newspaper,
    title: "AI-Generated News",
    description: "Daily financial news articles written and optimized by AI agents.",
  },
  {
    icon: Globe,
    title: "Currency Analytics",
    description: "Real-time exchange rates, currency strength analysis, and forex insights.",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Machine learning-powered market outlook and asset predictions.",
  },
  {
    icon: BarChart3,
    title: "Economic Indicators",
    description: "Track CPI, unemployment, GDP, and key macroeconomic data.",
  },
  {
    icon: Wrench,
    title: "Financial Tools",
    description: "Free calculators for currency conversion, inflation, and compound interest.",
  },
  {
    icon: Shield,
    title: "Data-Driven Insights",
    description: "Analysis backed by data from Alpha Vantage, FRED, and more.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
        <div className="container-main relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <Brain className="h-4 w-4" />
              AI-Powered Financial Intelligence
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-6xl">
              Your Complete{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                Financial Intelligence
              </span>{" "}
              Platform
            </h1>
            <p className="mt-6 text-lg text-brand-200 md:text-xl">
              SphereVista360 delivers AI-generated financial news, real-time
              market analytics, currency insights, economic predictions, and
              interactive financial tools — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600"
              >
                <TrendingUp className="h-5 w-5" />
                View Dashboard
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                <Wrench className="h-5 w-5" />
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container-main py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <MarketOverview data={demoMarketData} />
            <LatestNewsCard news={demoNews} />
          </div>
          <div className="space-y-6">
            <CurrencyStrengthCard data={demoCurrencyStrength} />
            <PredictionsCard predictions={demoPredictions} />
            <ToolsGrid />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need for Financial Intelligence
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Powered by AI agents and real-time data from trusted sources
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <feature.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-main">
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-10 text-center text-white">
            <h2 className="text-3xl font-bold">
              Stay Ahead of the Markets
            </h2>
            <p className="mt-3 text-brand-200">
              Get daily AI-generated financial insights delivered to your inbox.
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <NewsletterSignup variant="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SphereVista360",
            url: "https://spherevista360.com",
            description: "AI-Powered Financial Intelligence & Analytics Platform",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://spherevista360.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}

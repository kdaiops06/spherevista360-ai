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
  AlertTriangle,
} from "lucide-react";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { CurrencyStrengthCard } from "@/components/dashboard/CurrencyStrengthCard";
import { PredictionsCard } from "@/components/dashboard/PredictionsCard";
import { LatestNewsCard } from "@/components/dashboard/LatestNewsCard";
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import GlobalRiskRadar from "@/components/dashboard/GlobalRiskRadar";
import { NewsletterSignup } from "@/components/monetization/NewsletterSignup";
import { getMarketData, getCurrencyStrength, getPredictions, getLatestNews } from "@/lib/fetch-live-data";
import { buildMarketPulse, getRecessionSignal } from "@/lib/financial-intelligence";

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

export default async function HomePage() {
  const [market, currency, preds, news, recessionSignal] = await Promise.all([
    getMarketData(),
    getCurrencyStrength(),
    getPredictions(),
    getLatestNews(),
    getRecessionSignal(),
  ]);

  const pulseItems = buildMarketPulse({
    marketData: market.data,
    currencyStrength: currency.data,
    predictions: preds.data,
    recessionSignal,
  });

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
              AI-Powered{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                Financial Intelligence Platform
              </span>{" "}
            </h1>
            <p className="mt-6 text-lg text-brand-200 md:text-xl">
              Track currencies, markets, inflation, and global risks with real-time AI insights.
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

      <MarketPulse items={pulseItems} />

      {/* Portfolio Analyzer Promo Section */}
      <section className="container-main py-12">
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-8 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-900 mb-2">Analyze Your Portfolio with AI</h2>
          <p className="text-brand-700 mb-2">
            See if your portfolio is at risk — and how to optimize it using AI
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Free • No signup required
          </p>
          <Link
            href="/portfolio-analyzer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600 shadow-md"
          >
            Analyze My Portfolio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container-main py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <MarketOverview data={market.data} isLive={market.isLive} source={market.source} lastUpdated={market.lastUpdated} />
            <LatestNewsCard news={news.data} isLive={news.isLive} source={news.source} lastUpdated={news.lastUpdated} />
          </div>
          <div className="space-y-6">
            <CurrencyStrengthCard data={currency.data} isLive={currency.isLive} source={currency.source} lastUpdated={currency.lastUpdated} />
            <PredictionsCard predictions={preds.data} isLive={preds.isLive} source={preds.source} lastUpdated={preds.lastUpdated} />
            <GlobalRiskRadar compact />
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

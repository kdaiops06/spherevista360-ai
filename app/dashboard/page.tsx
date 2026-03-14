import type { Metadata } from "next";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { CurrencyStrengthCard } from "@/components/dashboard/CurrencyStrengthCard";
import { PredictionsCard } from "@/components/dashboard/PredictionsCard";
import { LatestNewsCard } from "@/components/dashboard/LatestNewsCard";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import { getMarketData, getCurrencyStrength, getPredictions, getLatestNews } from "@/lib/fetch-live-data";

export const metadata: Metadata = {
  title: "Financial Dashboard",
  description:
    "Real-time financial dashboard with market overview, currency strength, AI predictions, and latest news.",
};

export default async function DashboardPage() {
  const [market, currency, preds, news] = await Promise.all([
    getMarketData(),
    getCurrencyStrength(),
    getPredictions(),
    getLatestNews(),
  ]);

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
          <MarketOverview data={market.data} />
          <LatestNewsCard news={news.news} />
        </div>
        <div className="space-y-6">
          <CurrencyStrengthCard data={currency.data} />
          <PredictionsCard predictions={preds.predictions} />
          <ToolsGrid />
        </div>
      </div>
    </div>
  );
}

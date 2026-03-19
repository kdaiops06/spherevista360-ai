
import type { Metadata } from "next";
import NewsRealtimeSection from "@/components/dashboard/NewsRealtimeSection";

export const metadata: Metadata = {
  title: "Financial News & Analysis",
  description:
    "AI-generated financial news, market analysis, and economic insights. Stay informed with daily articles powered by artificial intelligence.",
};

export default function NewsPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Financial News & Analysis
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          AI-generated insights covering markets, currencies, and macroeconomics
        </p>
      </div>
      <NewsRealtimeSection />
    </div>
  );
}

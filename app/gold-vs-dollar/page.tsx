import type { Metadata } from "next";
import { CurrencyForecastEngine } from "@/components/tools/CurrencyForecastEngine";

export const metadata: Metadata = {
  title: "Gold vs Dollar Forecast - Trend and Macro Factors",
  description:
    "Gold vs Dollar forecast with trend signals, confidence score, and macro factors affecting XAU/USD.",
};

export default function GoldVsDollarForecastPage() {
  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Gold vs Dollar Forecast</h1>
      <p className="text-lg text-gray-600 mb-8">Track XAU/USD trend, projection ranges, and macro drivers.</p>
      <CurrencyForecastEngine />
    </div>
  );
}
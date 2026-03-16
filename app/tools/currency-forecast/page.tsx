import type { Metadata } from "next";
import { CurrencyForecastEngine } from "@/components/tools/CurrencyForecastEngine";

export const metadata: Metadata = {
  title: "Currency Forecast Engine - USD/INR, EUR/USD, Gold vs Dollar",
  description:
    "AI-powered currency forecast engine with 3-month and 6-month projections, trend signals, confidence scores, and macro drivers.",
};

export default function CurrencyForecastPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Currency Forecast Engine</h1>
        <p className="mt-3 text-lg text-gray-600">Projection model for USD/INR, EUR/USD, and Gold vs Dollar</p>
      </div>
      <CurrencyForecastEngine />
    </div>
  );
}
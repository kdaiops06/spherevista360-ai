import type { Metadata } from "next";
import { CurrencyForecastEngine } from "@/components/tools/CurrencyForecastEngine";

export const metadata: Metadata = {
  title: "USD INR Forecast - 3 and 6 Month Outlook",
  description:
    "Daily USD/INR forecast with trend direction, confidence score, macro factors, and projected range.",
};

export default function UsdInrForecastPage() {
  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">USD/INR Forecast</h1>
      <p className="text-lg text-gray-600 mb-8">AI-driven currency outlook updated daily from macro inputs.</p>
      <CurrencyForecastEngine />
    </div>
  );
}
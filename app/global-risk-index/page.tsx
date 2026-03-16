import type { Metadata } from "next";
import { GlobalStressIndex } from "@/components/tools/GlobalStressIndex";

export const metadata: Metadata = {
  title: "Global Risk Index - Inflation, Debt, Currency and Geopolitics",
  description:
    "Global risk index combining inflation stress, debt burden, currency volatility, and geopolitical tension.",
};

export default function GlobalRiskIndexPage() {
  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Global Risk Index</h1>
      <p className="text-lg text-gray-600 mb-8">Daily macro stress score for global markets.</p>
      <GlobalStressIndex />
    </div>
  );
}
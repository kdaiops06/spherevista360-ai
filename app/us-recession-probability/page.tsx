import type { Metadata } from "next";
import { computeRecessionProbability } from "@/lib/advanced-finance";

export const metadata: Metadata = {
  title: "US Recession Probability - Macro Risk Score",
  description:
    "Track US recession probability using yield curve, CPI momentum, unemployment, and GDP growth indicators.",
};

export default function UsRecessionProbabilityPage() {
  const result = computeRecessionProbability();

  return (
    <div className="container-main py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900">US Recession Probability</h1>
      <p className="mt-3 text-lg text-gray-600">Macro-derived risk score using yield curve, CPI, unemployment, and GDP.</p>

      <div className="mt-8 rounded-xl bg-yellow-50 p-6 text-center">
        <p className="text-sm text-yellow-700">Recession Probability Score</p>
        <p className="text-5xl font-bold text-yellow-800 mt-1">{result.score}/100</p>
      </div>

      <div className="mt-6 space-y-3">
        {result.components.map((item) => (
          <div key={item.name} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <span className="text-gray-700">{item.name}</span>
            <span className="font-semibold text-gray-900">Impact {item.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
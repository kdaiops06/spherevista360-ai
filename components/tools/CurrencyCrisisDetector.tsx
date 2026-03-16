"use client";

import { TrendingDown } from "lucide-react";
import { detectCurrencyCrisis } from "@/lib/advanced-finance";

export function CurrencyCrisisDetector() {
  const entries = detectCurrencyCrisis();

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <TrendingDown className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Currency Crisis Detector</h2>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.currency} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900">{entry.country} ({entry.currency})</p>
              <p className="text-sm font-bold text-red-600">Risk {entry.risk}/100</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
              <p>Inflation: <span className="font-medium text-gray-900">{entry.inflation}%</span></p>
              <p>Reserves: <span className="font-medium text-gray-900">{entry.reservesMonths} mo</span></p>
              <p>Debt/GDP: <span className="font-medium text-gray-900">{entry.debtToGdp}%</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
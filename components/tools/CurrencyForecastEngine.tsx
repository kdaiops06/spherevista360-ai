"use client";

import { useMemo, useState } from "react";
import { Brain } from "lucide-react";
import { generateCurrencyForecast } from "@/lib/advanced-finance";

const PAIRS = ["USD/INR", "EUR/USD", "XAU/USD"];

export function CurrencyForecastEngine() {
  const [pair, setPair] = useState(PAIRS[0]);
  const forecast = useMemo(() => generateCurrencyForecast(pair), [pair]);

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Brain className="h-6 w-6 text-brand-600" />
        <h2 className="text-2xl font-bold text-gray-900">Currency Forecast Engine</h2>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Forecast Pair</label>
        <select
          value={pair}
          onChange={(e) => setPair(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {PAIRS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Trend</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{forecast.trend}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Confidence</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{forecast.confidence}%</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-blue-700">3-Month Projection</p>
          <p className="mt-1 text-xl font-bold text-blue-900">{forecast.projection3m}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4">
          <p className="text-sm text-indigo-700">6-Month Projection</p>
          <p className="mt-1 text-xl font-bold text-indigo-900">{forecast.projection6m}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Key Macro Factors</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          {forecast.macroFactors.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-500">Source: {forecast.source}</p>
      </div>
    </div>
  );
}
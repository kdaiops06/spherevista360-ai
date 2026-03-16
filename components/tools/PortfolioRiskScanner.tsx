"use client";

import { useMemo, useState } from "react";
import { Shield } from "lucide-react";
import { scanPortfolioRisk } from "@/lib/advanced-finance";

export function PortfolioRiskScanner() {
  const [input, setInput] = useState("SPY, BTC, GLD");
  const assets = useMemo(() => input.split(",").map((a) => a.trim()).filter(Boolean), [input]);
  const result = useMemo(() => scanPortfolioRisk(assets), [assets]);

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Shield className="h-6 w-6 text-brand-600" />
        <h2 className="text-2xl font-bold text-gray-900">AI Portfolio Risk Scanner</h2>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-2">Enter assets (comma separated)</label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 mb-5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        placeholder="SPY, BTC, GLD"
      />

      <div className="grid gap-4 md:grid-cols-2 mb-5">
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm text-green-700">Diversification Score</p>
          <p className="text-3xl font-bold text-green-800 mt-1">{result.diversificationScore}/100</p>
        </div>
        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-sm text-red-700">Volatility Risk</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{result.volatilityRisk}/100</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Correlation Risks</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          {result.correlationRisks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
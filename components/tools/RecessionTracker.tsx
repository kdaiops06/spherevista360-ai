"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface Indicator {
  name: string;
  value: number;
  weight: number;
  threshold: number;
  unit: string;
  description: string;
}

const DEFAULT_INDICATORS: Indicator[] = [
  { name: "Yield Curve Spread (10Y-2Y)", value: -0.15, weight: 0.25, threshold: 0, unit: "%", description: "Negative spread has historically preceded recessions" },
  { name: "Unemployment Rate", value: 4.1, weight: 0.15, threshold: 5.0, unit: "%", description: "Rising unemployment signals economic weakness" },
  { name: "Consumer Confidence", value: 98, weight: 0.15, threshold: 80, unit: "", description: "Below 80 indicates pessimism about the economy" },
  { name: "Manufacturing PMI", value: 48.5, weight: 0.15, threshold: 50, unit: "", description: "Below 50 signals manufacturing contraction" },
  { name: "Leading Economic Index (LEI)", value: -0.3, weight: 0.15, threshold: 0, unit: "%", description: "Negative MoM change suggests economic slowdown" },
  { name: "Credit Spread (Baa-Aaa)", value: 1.8, weight: 0.15, threshold: 2.0, unit: "%", description: "Widening spreads indicate rising default risk" },
];

function computeProbability(indicators: Indicator[]): number {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const ind of indicators) {
    totalWeight += ind.weight;
    let signal: number;
    if (ind.name.includes("Yield Curve") || ind.name.includes("LEI")) {
      signal = ind.value < ind.threshold ? Math.min(1, Math.abs(ind.value - ind.threshold) * 2) : 0;
    } else if (ind.name.includes("PMI") || ind.name.includes("Consumer")) {
      signal = ind.value < ind.threshold ? Math.min(1, (ind.threshold - ind.value) / ind.threshold) : 0;
    } else if (ind.name.includes("Unemployment")) {
      signal = ind.value > ind.threshold ? Math.min(1, (ind.value - ind.threshold) / ind.threshold) : 0;
    } else {
      signal = ind.value > ind.threshold ? Math.min(1, (ind.value - ind.threshold) / ind.threshold) : 0;
    }
    weightedScore += signal * ind.weight;
  }

  return Math.round((weightedScore / totalWeight) * 100);
}

export function RecessionTracker() {
  const [indicators, setIndicators] = useState<Indicator[]>(DEFAULT_INDICATORS);
  const probability = computeProbability(indicators);

  const updateIndicator = (index: number, value: string) => {
    const updated = [...indicators];
    updated[index] = { ...updated[index], value: parseFloat(value) || 0 };
    setIndicators(updated);
  };

  const riskLevel = probability >= 60 ? "High" : probability >= 30 ? "Moderate" : "Low";
  const riskColor = probability >= 60 ? "text-red-600" : probability >= 30 ? "text-yellow-600" : "text-green-600";
  const riskBg = probability >= 60 ? "bg-red-50" : probability >= 30 ? "bg-yellow-50" : "bg-green-50";

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-900">Recession Probability Tracker</h2>
      </div>

      {/* Probability Gauge */}
      <div className={`rounded-xl p-6 mb-6 text-center ${riskBg}`}>
        <p className="text-sm text-gray-600 mb-1">Recession Probability</p>
        <p className={`text-5xl font-bold ${riskColor}`}>{probability}%</p>
        <p className={`text-sm font-medium mt-1 ${riskColor}`}>Risk Level: {riskLevel}</p>
        <div className="mt-3 h-4 rounded-full bg-gray-200 overflow-hidden max-w-sm mx-auto">
          <div
            className={`h-full rounded-full transition-all ${probability >= 60 ? "bg-red-500" : probability >= 30 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>

      {/* Indicators */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Key Economic Indicators</h3>
        {indicators.map((ind, i) => (
          <div key={ind.name} className="rounded-lg border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{ind.name}</span>
              <span className="text-xs text-gray-400">Threshold: {ind.threshold}{ind.unit}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{ind.description}</p>
            <input
              type="number"
              value={ind.value}
              onChange={(e) => updateIndicator(i, e.target.value)}
              step="0.1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

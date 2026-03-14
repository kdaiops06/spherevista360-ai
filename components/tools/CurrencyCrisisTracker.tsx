"use client";

import { useState } from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface CountryRisk {
  country: string;
  currency: string;
  debtToGDP: number;
  inflationRate: number;
  reserveMonths: number;
  currentAccountPercent: number;
  riskScore: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
}

const DEFAULT_DATA: Omit<CountryRisk, "riskScore" | "riskLevel">[] = [
  { country: "Argentina", currency: "ARS", debtToGDP: 85, inflationRate: 142, reserveMonths: 2.1, currentAccountPercent: -3.2 },
  { country: "Turkey", currency: "TRY", debtToGDP: 35, inflationRate: 58, reserveMonths: 3.5, currentAccountPercent: -5.1 },
  { country: "Egypt", currency: "EGP", debtToGDP: 92, inflationRate: 28, reserveMonths: 4.2, currentAccountPercent: -3.8 },
  { country: "Nigeria", currency: "NGN", debtToGDP: 38, inflationRate: 22, reserveMonths: 5.1, currentAccountPercent: -1.2 },
  { country: "Pakistan", currency: "PKR", debtToGDP: 75, inflationRate: 18, reserveMonths: 2.8, currentAccountPercent: -2.5 },
  { country: "Sri Lanka", currency: "LKR", debtToGDP: 110, inflationRate: 12, reserveMonths: 3.0, currentAccountPercent: -4.5 },
  { country: "Brazil", currency: "BRL", debtToGDP: 75, inflationRate: 4.5, reserveMonths: 14, currentAccountPercent: -2.8 },
  { country: "India", currency: "INR", debtToGDP: 82, inflationRate: 5.2, reserveMonths: 11, currentAccountPercent: -1.8 },
  { country: "South Africa", currency: "ZAR", debtToGDP: 73, inflationRate: 5.8, reserveMonths: 5.5, currentAccountPercent: -2.3 },
  { country: "Mexico", currency: "MXN", debtToGDP: 48, inflationRate: 4.2, reserveMonths: 5.8, currentAccountPercent: -1.5 },
];

function computeRisk(d: Omit<CountryRisk, "riskScore" | "riskLevel">): CountryRisk {
  let score = 0;
  // Debt/GDP contribution
  if (d.debtToGDP > 100) score += 30;
  else if (d.debtToGDP > 70) score += 20;
  else if (d.debtToGDP > 50) score += 10;
  // Inflation contribution
  if (d.inflationRate > 50) score += 30;
  else if (d.inflationRate > 20) score += 20;
  else if (d.inflationRate > 10) score += 10;
  else if (d.inflationRate > 5) score += 5;
  // Reserve months
  if (d.reserveMonths < 3) score += 25;
  else if (d.reserveMonths < 5) score += 15;
  else if (d.reserveMonths < 8) score += 5;
  // Current account
  if (d.currentAccountPercent < -4) score += 15;
  else if (d.currentAccountPercent < -2) score += 10;
  else if (d.currentAccountPercent < 0) score += 5;

  const riskLevel: CountryRisk["riskLevel"] =
    score >= 70 ? "critical" : score >= 45 ? "high" : score >= 25 ? "moderate" : "low";

  return { ...d, riskScore: Math.min(100, score), riskLevel };
}

export function CurrencyCrisisTracker() {
  const [data] = useState<CountryRisk[]>(
    DEFAULT_DATA.map(computeRisk).sort((a, b) => b.riskScore - a.riskScore)
  );

  const levelColors = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    moderate: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  const barColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    moderate: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Currency Crisis Tracker</h2>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 mb-6">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">Risk scores are based on debt-to-GDP, inflation, foreign reserves, and current account balance. For educational purposes only.</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.country} className="rounded-lg border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900">{item.country}</span>
                <span className="ml-2 text-xs text-gray-400">{item.currency}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[item.riskLevel]}`}>
                {item.riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-2">
              <div className={`h-full rounded-full ${barColors[item.riskLevel]}`} style={{ width: `${item.riskScore}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
              <div>Debt/GDP: <span className="font-medium text-gray-700">{item.debtToGDP}%</span></div>
              <div>Inflation: <span className="font-medium text-gray-700">{item.inflationRate}%</span></div>
              <div>Reserves: <span className="font-medium text-gray-700">{item.reserveMonths}mo</span></div>
              <div>CA: <span className="font-medium text-gray-700">{item.currentAccountPercent}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

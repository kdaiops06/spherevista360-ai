"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

export function SIPCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("15");
  const [result, setResult] = useState<{
    maturityValue: number;
    totalInvested: number;
    wealthGained: number;
    yearlyBreakdown: { year: number; invested: number; value: number }[];
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(monthly);
    const annualRate = parseFloat(rate) / 100;
    const t = parseInt(years);
    if (isNaN(P) || isNaN(annualRate) || isNaN(t) || P <= 0 || t <= 0) return;

    const monthlyRate = annualRate / 12;
    const totalMonths = t * 12;
    const yearlyBreakdown: { year: number; invested: number; value: number }[] = [];

    for (let y = 1; y <= t; y++) {
      const n = y * 12;
      const fv = P * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
      yearlyBreakdown.push({
        year: y,
        invested: Math.round(P * n),
        value: Math.round(fv),
      });
    }

    const maturityValue = P * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = P * totalMonths;

    setResult({
      maturityValue,
      totalInvested,
      wealthGained: maturityValue - totalInvested,
      yearlyBreakdown,
    });
  };

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-brand-600" />
        <h2 className="text-2xl font-bold text-gray-900">SIP Calculator</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Investment ($)</label>
          <input type="number" value={monthly} onChange={(e) => { setMonthly(e.target.value); setResult(null); }} min="0" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Annual Return (%)</label>
            <input type="number" value={rate} onChange={(e) => { setRate(e.target.value); setResult(null); }} min="0" max="50" step="0.1" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Years)</label>
            <input type="number" value={years} onChange={(e) => { setYears(e.target.value); setResult(null); }} min="1" max="50" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full py-3 text-base">Calculate</button>

        {result && (
          <div className="space-y-3 rounded-lg bg-brand-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Maturity Value</p>
              <p className="text-3xl font-bold text-brand-700">${result.maturityValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Invested</p>
                <p className="font-semibold text-gray-900">${result.totalInvested.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Wealth Gained</p>
                <p className="font-semibold text-green-600">${result.wealthGained.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Growth Milestones</p>
              <div className="space-y-1">
                {result.yearlyBreakdown.filter((_, i) => (i + 1) % 5 === 0 || i === result.yearlyBreakdown.length - 1).map((y) => (
                  <div key={y.year} className="flex justify-between text-sm">
                    <span className="text-gray-600">Year {y.year}</span>
                    <span className="font-medium">${y.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

export function InvestmentReturnCalculator() {
  const [initial, setInitial] = useState("10000");
  const [finalVal, setFinalVal] = useState("25000");
  const [years, setYears] = useState("5");
  const [result, setResult] = useState<{
    totalReturn: number;
    totalReturnPercent: number;
    annualizedReturn: number;
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(initial);
    const F = parseFloat(finalVal);
    const t = parseFloat(years);
    if (isNaN(P) || isNaN(F) || isNaN(t) || P <= 0 || t <= 0) return;

    const totalReturn = F - P;
    const totalReturnPercent = ((F - P) / P) * 100;
    const annualizedReturn = (Math.pow(F / P, 1 / t) - 1) * 100;

    setResult({ totalReturn, totalReturnPercent, annualizedReturn });
  };

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-accent-600" />
        <h2 className="text-2xl font-bold text-gray-900">Investment Return Calculator</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Investment ($)</label>
          <input type="number" value={initial} onChange={(e) => { setInitial(e.target.value); setResult(null); }} min="0" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Final Value ($)</label>
          <input type="number" value={finalVal} onChange={(e) => { setFinalVal(e.target.value); setResult(null); }} min="0" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Holding Period (Years)</label>
          <input type="number" value={years} onChange={(e) => { setYears(e.target.value); setResult(null); }} min="0.1" step="0.1" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>

        <button onClick={calculate} className="btn-primary w-full py-3 text-base">Calculate</button>

        {result && (
          <div className="space-y-3 rounded-lg bg-accent-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Annualized Return (CAGR)</p>
              <p className="text-3xl font-bold text-accent-700">{result.annualizedReturn.toFixed(2)}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Return</p>
                <p className="font-semibold text-gray-900">${result.totalReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Return %</p>
                <p className={`font-semibold ${result.totalReturnPercent >= 0 ? "text-green-600" : "text-red-600"}`}>{result.totalReturnPercent.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

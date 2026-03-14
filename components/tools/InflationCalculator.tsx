"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

export function InflationCalculator() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("3.0");
  const [years, setYears] = useState("10");
  const [result, setResult] = useState<{
    futureValue: number;
    purchasingPower: number;
    totalInflation: number;
  } | null>(null);

  const calculate = () => {
    const a = parseFloat(amount);
    const r = parseFloat(rate) / 100;
    const y = parseInt(years);

    if (isNaN(a) || isNaN(r) || isNaN(y) || a <= 0 || y <= 0) return;

    const futureValue = a * Math.pow(1 + r, y);
    const purchasingPower = a / Math.pow(1 + r, y);
    const totalInflation = ((futureValue - a) / a) * 100;

    setResult({ futureValue, purchasingPower, totalInflation });
  };

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-brand-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Inflation Calculator
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setResult(null);
            }}
            min="0"
            step="100"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Inflation Rate (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setResult(null);
            }}
            min="0"
            max="50"
            step="0.1"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Years
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => {
              setYears(e.target.value);
              setResult(null);
            }}
            min="1"
            max="100"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <button onClick={calculate} className="btn-primary w-full py-3 text-base">
          Calculate
        </button>

        {result && (
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Cost of equivalent goods in {years} years
              </span>
              <span className="font-semibold text-red-600">
                ${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Purchasing power of ${parseFloat(amount).toLocaleString()}
              </span>
              <span className="font-semibold text-brand-700">
                ${result.purchasingPower.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-sm text-gray-600">Total inflation over period</span>
              <span className="font-semibold text-gray-900">
                {result.totalInflation.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

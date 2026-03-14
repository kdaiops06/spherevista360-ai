"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

export function PurchasingPowerCalculator() {
  const [amount, setAmount] = useState("100");
  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2026");
  const [result, setResult] = useState<{
    adjustedAmount: number;
    cumulativeInflation: number;
    avgAnnualRate: number;
  } | null>(null);

  // Simplified CPI-based inflation data (annual average CPI, base 1982-84=100)
  const cpiData: Record<number, number> = {
    1990: 130.7, 1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2,
    1995: 152.4, 1996: 156.9, 1997: 160.5, 1998: 163.0, 1999: 166.6,
    2000: 172.2, 2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9,
    2005: 195.3, 2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5,
    2010: 218.1, 2011: 224.9, 2012: 229.6, 2013: 233.0, 2014: 236.7,
    2015: 237.0, 2016: 240.0, 2017: 245.1, 2018: 251.1, 2019: 255.7,
    2020: 258.8, 2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 314.2,
    2025: 321.5, 2026: 328.0,
  };

  const calculate = () => {
    const a = parseFloat(amount);
    const sy = parseInt(startYear);
    const ey = parseInt(endYear);

    if (isNaN(a) || isNaN(sy) || isNaN(ey) || a <= 0) return;
    if (!cpiData[sy] || !cpiData[ey]) return;

    const ratio = cpiData[ey] / cpiData[sy];
    const adjustedAmount = a * ratio;
    const cumulativeInflation = (ratio - 1) * 100;
    const yearsDiff = ey - sy;
    const avgAnnualRate =
      yearsDiff > 0
        ? (Math.pow(ratio, 1 / yearsDiff) - 1) * 100
        : 0;

    setResult({ adjustedAmount, cumulativeInflation, avgAnnualRate });
  };

  const availableYears = Object.keys(cpiData)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-6 w-6 text-brand-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Purchasing Power Calculator
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setResult(null); }}
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Year
            </label>
            <select
              value={startYear}
              onChange={(e) => { setStartYear(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Year
            </label>
            <select
              value={endYear}
              onChange={(e) => { setEndYear(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full py-3 text-base">
          Calculate Purchasing Power
        </button>

        {result && (
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ${parseFloat(amount).toLocaleString()} in {startYear} is equivalent to
              </p>
              <p className="text-3xl font-bold text-brand-700 mt-1">
                ${result.adjustedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">in {endYear}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Cumulative Inflation</p>
                <p className="font-semibold text-red-600">
                  {result.cumulativeInflation.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avg. Annual Rate</p>
                <p className="font-semibold text-gray-900">
                  {result.avgAnnualRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

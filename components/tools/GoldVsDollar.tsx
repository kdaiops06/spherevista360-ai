"use client";

import { useState } from "react";
import { Coins } from "lucide-react";

interface PricePoint { year: number; gold: number; dollar: number }

const HISTORICAL_DATA: PricePoint[] = [
  { year: 2000, gold: 279, dollar: 100 },
  { year: 2002, gold: 310, dollar: 96.5 },
  { year: 2004, gold: 410, dollar: 92.8 },
  { year: 2006, gold: 603, dollar: 88.2 },
  { year: 2008, gold: 872, dollar: 83.1 },
  { year: 2010, gold: 1225, dollar: 80.4 },
  { year: 2012, gold: 1670, dollar: 76.8 },
  { year: 2014, gold: 1266, dollar: 74.2 },
  { year: 2016, gold: 1251, dollar: 72.1 },
  { year: 2018, gold: 1268, dollar: 69.5 },
  { year: 2020, gold: 1770, dollar: 67.2 },
  { year: 2022, gold: 1800, dollar: 59.8 },
  { year: 2024, gold: 2650, dollar: 55.6 },
  { year: 2026, gold: 2950, dollar: 53.2 },
];

export function GoldVsDollar() {
  const [investAmount, setInvestAmount] = useState("10000");
  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2026");
  const [result, setResult] = useState<{
    goldReturn: number; goldFinal: number; goldPct: number;
    dollarPower: number; dollarLoss: number;
  } | null>(null);

  const calculate = () => {
    const amount = parseFloat(investAmount);
    const sy = parseInt(startYear);
    const ey = parseInt(endYear);
    if (isNaN(amount) || amount <= 0) return;

    const startData = HISTORICAL_DATA.find((d) => d.year === sy);
    const endData = HISTORICAL_DATA.find((d) => d.year === ey);
    if (!startData || !endData) return;

    const goldOunces = amount / startData.gold;
    const goldFinal = goldOunces * endData.gold;
    const goldReturn = goldFinal - amount;
    const goldPct = ((goldFinal - amount) / amount) * 100;

    const dollarPower = amount * (endData.dollar / startData.dollar);
    const dollarLoss = amount - dollarPower;

    setResult({ goldReturn, goldFinal, goldPct, dollarPower, dollarLoss });
  };

  const years = HISTORICAL_DATA.map((d) => d.year);

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="h-6 w-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-900">Gold vs Dollar</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount ($)</label>
          <input type="number" value={investAmount} onChange={(e) => { setInvestAmount(e.target.value); setResult(null); }} min="0" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
            <select value={startYear} onChange={(e) => { setStartYear(e.target.value); setResult(null); }} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
            <select value={endYear} onChange={(e) => { setEndYear(e.target.value); setResult(null); }} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={calculate} className="btn-primary w-full py-3 text-base">Compare</button>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-yellow-50 p-4 text-center">
                <p className="text-xs font-medium text-yellow-700 mb-1">Gold Investment</p>
                <p className="text-2xl font-bold text-yellow-700">${result.goldFinal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className={`text-sm font-medium mt-1 ${result.goldPct >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {result.goldPct >= 0 ? "+" : ""}{result.goldPct.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-xs font-medium text-green-700 mb-1">Dollar Purchasing Power</p>
                <p className="text-2xl font-bold text-green-700">${result.dollarPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-sm font-medium mt-1 text-red-600">
                  -${result.dollarLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })} lost
                </p>
              </div>
            </div>

            {/* Historical chart - simple bar representation */}
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Gold Price History ($/oz)</p>
              <div className="space-y-2">
                {HISTORICAL_DATA.map((d) => (
                  <div key={d.year} className="flex items-center gap-2">
                    <span className="w-10 text-xs text-gray-500">{d.year}</span>
                    <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
                      <div className="h-full rounded bg-yellow-400" style={{ width: `${(d.gold / 3000) * 100}%` }} />
                    </div>
                    <span className="w-16 text-xs text-right text-gray-700">${d.gold.toLocaleString()}</span>
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

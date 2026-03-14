"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");
  const [compound, setCompound] = useState("12");
  const [monthlyAdd, setMonthlyAdd] = useState("500");
  const [result, setResult] = useState<{
    finalAmount: number;
    totalContributions: number;
    totalInterest: number;
    yearlyBreakdown: { year: number; balance: number; interest: number }[];
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseInt(years);
    const n = parseInt(compound);
    const m = parseFloat(monthlyAdd);

    if ([P, r, t, n].some(isNaN) || P < 0 || t <= 0 || n <= 0) return;

    const yearlyBreakdown: { year: number; balance: number; interest: number }[] = [];
    let balance = P;
    let totalContributed = P;

    for (let year = 1; year <= t; year++) {
      const startBalance = balance;
      for (let period = 0; period < n; period++) {
        balance += balance * (r / n);
        balance += (m * 12) / n;
      }
      totalContributed += m * 12;
      yearlyBreakdown.push({
        year,
        balance: Math.round(balance * 100) / 100,
        interest: Math.round((balance - totalContributed) * 100) / 100,
      });
    }

    setResult({
      finalAmount: balance,
      totalContributions: totalContributed,
      totalInterest: balance - totalContributed,
      yearlyBreakdown,
    });
  };

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-accent-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Compound Interest Calculator
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => { setPrincipal(e.target.value); setResult(null); }}
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Rate (%)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => { setRate(e.target.value); setResult(null); }}
              min="0"
              max="100"
              step="0.1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => { setYears(e.target.value); setResult(null); }}
              min="1"
              max="100"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compound Per Year
            </label>
            <select
              value={compound}
              onChange={(e) => { setCompound(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="1">Annually</option>
              <option value="4">Quarterly</option>
              <option value="12">Monthly</option>
              <option value="365">Daily</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Addition ($)
            </label>
            <input
              type="number"
              value={monthlyAdd}
              onChange={(e) => { setMonthlyAdd(e.target.value); setResult(null); }}
              min="0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full py-3 text-base">
          Calculate
        </button>

        {result && (
          <div className="space-y-3 rounded-lg bg-accent-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Final Balance</p>
              <p className="text-3xl font-bold text-accent-700">
                ${result.finalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Contributions</p>
                <p className="font-semibold text-gray-900">
                  ${result.totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Interest Earned</p>
                <p className="font-semibold text-accent-600">
                  ${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Milestone years */}
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Growth Milestones</p>
              <div className="space-y-1">
                {result.yearlyBreakdown
                  .filter((_, i) => (i + 1) % 5 === 0 || i === result.yearlyBreakdown.length - 1)
                  .map((y) => (
                    <div key={y.year} className="flex justify-between text-sm">
                      <span className="text-gray-600">Year {y.year}</span>
                      <span className="font-medium">
                        ${y.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
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

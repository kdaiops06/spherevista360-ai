"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

interface StrengthData {
  currency: string;
  name: string;
  strength: number;
  trend: "up" | "down" | "stable";
}

const CURRENCIES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  NZD: "New Zealand Dollar",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
};

function computeStrength(rate: number): number {
  // Inverted and scaled — lower rate vs USD = stronger currency
  if (rate <= 1) return Math.round(Math.min(95, 60 + (1 / rate) * 20));
  if (rate <= 2) return Math.round(55 + (2 - rate) * 15);
  if (rate <= 10) return Math.round(30 + (10 - rate) * 3);
  return Math.round(Math.max(10, 30 - Math.log10(rate) * 5));
}

export function CurrencyStrengthIndex() {
  const [data, setData] = useState<StrengthData[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();

  useEffect(() => {
    async function fetchStrength() {
      try {
        const res = await fetch("https://api.frankfurter.app/latest?base=USD");
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        // json = { base: "USD", date: "2026-03-14", rates: { EUR: 0.92, ... } }
        const strengths = Object.entries(CURRENCIES)
          .map(([code, name]): StrengthData | null => {
            const rate = code === "USD" ? 1 : (json.rates[code] as number | undefined);
            if (!rate) return null;
            return {
              currency: code,
              name,
              strength: code === "USD" ? 72 : computeStrength(rate),
              trend: "stable",
            };
          })
          .filter((x): x is StrengthData => x !== null)
          .sort((a, b) => b.strength - a.strength);
        setData(strengths);
        setIsLive(true);
        setLastUpdated(json.date);
      } catch {
        // Fallback to static illustrative data
        const fallbackRates: Record<string, number> = {
          USD: 1, EUR: 0.9234, GBP: 0.7891, JPY: 149.85, CHF: 0.8812,
          AUD: 1.5423, CAD: 1.3567, NZD: 1.6812, CNY: 7.2341, INR: 83.42,
          SGD: 1.3412, HKD: 7.8102,
        };
        const strengths: StrengthData[] = Object.entries(CURRENCIES)
          .map(([code, name]) => ({
            currency: code,
            name,
            strength: code === "USD" ? 72 : computeStrength(fallbackRates[code] || 1),
            trend: "stable" as const,
          }))
          .sort((a, b) => b.strength - a.strength);
        setData(strengths);
        setIsLive(false);
      }
    }
    fetchStrength();
  }, []);

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-brand-600" />
          <h2 className="text-2xl font-bold text-gray-900">Currency Strength Index</h2>
        </div>
        <DataSourceBadge isLive={isLive} source={isLive ? "European Central Bank" : undefined} lastUpdated={lastUpdated} />
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Relative strength of major world currencies based on exchange rate fundamentals. Higher score indicates a stronger currency.
        {!isLive && " (Showing illustrative data — live rates unavailable.)"}
      </p>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.currency} className="flex items-center gap-3">
            <div className="w-14 text-sm font-bold text-gray-900">{item.currency}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{item.name}</span>
                <span className="text-xs font-medium text-gray-700">{item.strength}/100</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.strength >= 65 ? "bg-green-500" : item.strength >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${item.strength}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-medium ${item.trend === "up" ? "text-green-600" : item.trend === "down" ? "text-red-600" : "text-gray-400"}`}>
              {item.trend === "up" ? "▲" : item.trend === "down" ? "▼" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

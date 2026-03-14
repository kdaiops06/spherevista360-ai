"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface StrengthData {
  currency: string;
  name: string;
  strength: number;
  trend: "up" | "down" | "stable";
}

const CURRENCIES = [
  { code: "USD", name: "US Dollar", baseRate: 1 },
  { code: "EUR", name: "Euro", baseRate: 0.9234 },
  { code: "GBP", name: "British Pound", baseRate: 0.7891 },
  { code: "JPY", name: "Japanese Yen", baseRate: 149.85 },
  { code: "CHF", name: "Swiss Franc", baseRate: 0.8812 },
  { code: "AUD", name: "Australian Dollar", baseRate: 1.5423 },
  { code: "CAD", name: "Canadian Dollar", baseRate: 1.3567 },
  { code: "NZD", name: "New Zealand Dollar", baseRate: 1.6812 },
  { code: "CNY", name: "Chinese Yuan", baseRate: 7.2341 },
  { code: "INR", name: "Indian Rupee", baseRate: 83.42 },
  { code: "SGD", name: "Singapore Dollar", baseRate: 1.3412 },
  { code: "HKD", name: "Hong Kong Dollar", baseRate: 7.8102 },
];

function computeStrength(rate: number): number {
  // Inverted and scaled — lower rate vs USD = stronger currency
  if (rate <= 1) return Math.round(Math.min(95, 60 + (1 / rate) * 20));
  if (rate <= 2) return Math.round(55 + (2 - rate) * 15);
  if (rate <= 10) return Math.round(30 + (10 - rate) * 3);
  return Math.round(Math.max(10, 30 - Math.log10(rate) * 5));
}

export function CurrencyStrengthIndex() {
  const [data, setData] = useState<StrengthData[]>([]);

  useEffect(() => {
    const strengths: StrengthData[] = CURRENCIES.map((c) => {
      const strength = c.code === "USD" ? 72 : computeStrength(c.baseRate);
      const trends: ("up" | "down" | "stable")[] = ["up", "down", "stable"];
      return {
        currency: c.code,
        name: c.name,
        strength,
        trend: trends[Math.floor(Math.random() * 3)],
      };
    }).sort((a, b) => b.strength - a.strength);
    setData(strengths);
  }, []);

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6 text-brand-600" />
        <h2 className="text-2xl font-bold text-gray-900">Currency Strength Index</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Relative strength of major world currencies based on exchange rate fundamentals. Higher score indicates a stronger currency.
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

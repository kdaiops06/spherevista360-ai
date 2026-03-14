"use client";

import { useState } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";

const currencies = [
  "USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD",
  "CNY", "INR", "SGD", "HKD", "KRW", "BRL", "MXN", "ZAR",
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`
      );
      const data = await res.json();
      setResult(data.result);
      setRate(data.rate);
    } catch {
      setResult(null);
    }
    setLoading(false);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setRate(null);
  };

  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Currency Converter
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setResult(null);
            }}
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-lg focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="mb-0.5 rounded-lg border border-gray-300 p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            aria-label="Swap currencies"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <select
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            "Convert"
          )}
        </button>

        {result !== null && rate !== null && (
          <div className="rounded-lg bg-brand-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              {parseFloat(amount).toLocaleString()} {from} =
            </p>
            <p className="text-3xl font-bold text-brand-700 mt-1">
              {result.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{" "}
              {to}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rate: 1 {from} = {rate.toFixed(6)} {to}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

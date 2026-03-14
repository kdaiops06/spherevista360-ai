"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRightLeft } from "lucide-react";

interface Props {
  fromCode: string;
  toCode: string;
  fromName: string;
  toName: string;
  fromSymbol: string;
  toSymbol: string;
}

export default function CurrencyPairConverter({
  fromCode,
  toCode,
  fromName,
  toName,
  fromSymbol,
  toSymbol,
}: Props) {
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const convert = useCallback(async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/convert?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&amount=${encodeURIComponent(amt)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
        setRate(data.rate);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [amount, fromCode, toCode]);

  useEffect(() => {
    convert();
  }, [convert]);

  const quickAmounts = [1, 10, 100, 1000, 5000, 10000];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
        {fromCode} to {toCode} Converter
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ({fromSymbol} {fromCode})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading rate...</div>
        ) : (
          <>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                {fromSymbol} {parseFloat(amount).toLocaleString()} {fromCode} =
              </p>
              <p className="text-3xl font-bold text-indigo-700 mt-1">
                {toSymbol} {result?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCode}
              </p>
              {rate && (
                <p className="text-xs text-gray-500 mt-2">
                  1 {fromCode} = {rate.toFixed(4)} {toCode}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => setAmount(String(qa))}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    {qa.toLocaleString()} {fromCode}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {rate && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Common Conversions
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[1, 5, 10, 50, 100, 500, 1000, 5000].map((v) => (
              <div key={v} className="flex justify-between text-gray-600">
                <span>{v} {fromCode}</span>
                <span className="font-medium">{(v * rate).toFixed(2)} {toCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

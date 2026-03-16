"use client";

import { AlertTriangle } from "lucide-react";
import { computeGlobalStressIndex } from "@/lib/advanced-finance";

export function GlobalStressIndex() {
  const result = computeGlobalStressIndex();

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Global Economic Stress Index</h2>
      </div>

      <div className="rounded-xl bg-orange-50 p-5 mb-5 text-center">
        <p className="text-sm text-orange-700">Global Risk Index</p>
        <p className="text-5xl font-bold text-orange-700 mt-1">{result.score}/100</p>
        <p className="text-sm text-gray-600 mt-2">{result.narrative}</p>
      </div>

      <div className="space-y-3">
        {result.components.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{item.name}</span>
              <span className="font-semibold text-gray-900">{item.score}</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
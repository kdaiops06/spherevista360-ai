import { cn } from "@/lib/utils";
import type { AIPrediction } from "@/types";
import { Brain } from "lucide-react";

interface PredictionsCardProps {
  predictions: AIPrediction[];
}

export function PredictionsCard({ predictions }: PredictionsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-bold text-gray-900">AI Predictions</h2>
      </div>

      <div className="space-y-3">
        {predictions.map((pred, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900">{pred.asset}</span>
              <span
                className={cn(
                  "badge",
                  pred.prediction === "bullish"
                    ? "bg-green-100 text-green-800"
                    : pred.prediction === "bearish"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {pred.prediction}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {pred.reasoning}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Confidence: {(pred.confidence * 100).toFixed(0)}%</span>
              <span>{pred.timeframe}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        AI predictions are for informational purposes only and do not
        constitute financial advice.
      </p>
    </div>
  );
}

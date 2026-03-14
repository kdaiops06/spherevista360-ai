import { cn } from "@/lib/utils";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import type { CurrencyStrength } from "@/types";

interface CurrencyStrengthCardProps {
  data: CurrencyStrength[];
  isLive?: boolean;
  source?: string;
  lastUpdated?: string;
}

export function CurrencyStrengthCard({ data, isLive = false, source, lastUpdated }: CurrencyStrengthCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Currency Strength
        </h2>
        <DataSourceBadge isLive={isLive} source={source} lastUpdated={lastUpdated} />
      </div>
      <div className="space-y-3">
        {data.map((currency) => (
          <div key={currency.currency} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {currency.currency}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  currency.trend === "up"
                    ? "text-green-600"
                    : currency.trend === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                )}
              >
                {currency.trend === "up" ? "▲" : currency.trend === "down" ? "▼" : "—"}{" "}
                {Math.abs(currency.change24h).toFixed(2)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currency.strength >= 70
                    ? "bg-green-500"
                    : currency.strength >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{ width: `${currency.strength}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

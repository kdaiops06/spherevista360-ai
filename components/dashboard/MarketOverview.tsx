import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import type { MarketData } from "@/types";

interface MarketOverviewProps {
  data: MarketData[];
  isLive?: boolean;
  source?: string;
  lastUpdated?: string;
}

function formatMarketValue(item: MarketData) {
  if (item.symbol === "^TNX" || item.name.toLowerCase().includes("yield")) {
    return `${item.price.toFixed(2)}%`;
  }

  if (item.symbol.startsWith("^")) {
    return formatNumber(Number(item.price.toFixed(2)));
  }

  return formatCurrency(item.price);
}

export function MarketOverview({ data, isLive = false, source, lastUpdated }: MarketOverviewProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Global Market Overview
        </h2>
        <DataSourceBadge isLive={isLive} source={source} lastUpdated={lastUpdated} />
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
          >
            <div>
              <p className="font-semibold text-gray-900">{item.symbol}</p>
              <p className="text-sm text-gray-500">{item.name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatMarketValue(item)}
              </p>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm",
                  item.changePercent > 0
                    ? "text-green-600"
                    : item.changePercent < 0
                    ? "text-red-600"
                    : "text-gray-500"
                )}
              >
                {item.changePercent > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : item.changePercent < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                {formatPercent(item.changePercent)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

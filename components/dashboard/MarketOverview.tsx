import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatNumber, formatPercent, calculatePercentageChange, calculateAbsoluteChange } from "@/lib/utils";
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
    return `${Number(item.price).toFixed(2)}%`;
  }
  if (item.symbol.startsWith("^")) {
    return formatNumber(Number(item.price));
  }
  return formatCurrency(Number(item.price));
}

// US Market open/close status (Eastern Time)
function getMarketStatus(): { open: boolean; label: string } {
  const now = new Date();
  // Convert to US Eastern Time
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const offset = -4; // EDT is UTC-4, EST is UTC-5; for simplicity, use -4 (March–Nov)
  const est = new Date(utc + 3600000 * offset);
  const hours = est.getHours();
  const minutes = est.getMinutes();
  const open = (hours > 9 || (hours === 9 && minutes >= 30)) && (hours < 16);
  return open
    ? { open: true, label: "Market Open" }
    : { open: false, label: "Market Closed" };
}

  const marketStatus = getMarketStatus();
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Global Market Overview
        </h2>
        <div className="flex items-center gap-2">
          <span className={cn("rounded px-2 py-1 text-xs font-semibold", marketStatus.open ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600")}>{marketStatus.label}</span>
          <DataSourceBadge isLive={isLive} source={source} lastUpdated={lastUpdated} />
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => {
          // Defensive: handle missing/invalid data
          const price = Number(item.price);
          const prevClose = price - Number(item.change);
          const percentChange = calculatePercentageChange(price, prevClose);
          const absChange = calculateAbsoluteChange(price, prevClose);
          const displayChange =
            percentChange !== null && !isNaN(percentChange)
              ? `${percentChange.toFixed(2)}%`
              : "N/A";
          const displayAbs =
            absChange !== null && !isNaN(absChange)
              ? `(${absChange > 0 ? "+" : ""}${absChange.toFixed(2)})`
              : "";
          return (
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
                    percentChange !== null && !isNaN(percentChange)
                      ? percentChange > 0
                        ? "text-green-600"
                        : percentChange < 0
                        ? "text-red-600"
                        : "text-gray-500"
                      : "text-gray-500"
                  )}
                >
                  {percentChange !== null && !isNaN(percentChange) ? (
                    percentChange > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : percentChange < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <Minus className="h-3.5 w-3.5" />
                    )
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                  {displayChange} {displayAbs}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

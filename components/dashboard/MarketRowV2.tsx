import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatNumber, calculatePercentageChangeV2, calculateAbsoluteChangeV2 } from "@/lib/utils";
import type { MarketData } from "@/types";
import React from "react";

interface MarketRowV2Props {
  item: MarketData;
  loading?: boolean;
}

export const MarketRowV2: React.FC<MarketRowV2Props> = ({ item, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 animate-pulse">
        <div>
          <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
        <div className="text-right">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const price = Number(item.price);
  const prevClose = price - Number(item.change);
  const percentChange = calculatePercentageChangeV2(price, prevClose);
  const absChange = calculateAbsoluteChangeV2(price, prevClose);
  const displayChange =
    percentChange !== null && !isNaN(percentChange)
      ? `${percentChange.toFixed(2)}%`
      : "N/A";
  const displayAbs =
    absChange !== null && !isNaN(absChange)
      ? `(${absChange > 0 ? "+" : ""}${absChange.toFixed(2)})`
      : "";
  const isUp = percentChange !== null && percentChange > 0;
  const isDown = percentChange !== null && percentChange < 0;

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <div>
        <p className="font-semibold text-gray-900">{item.symbol}</p>
        <p className="text-sm text-gray-500">{item.name}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          {item.symbol === "^TNX" || item.name.toLowerCase().includes("yield")
            ? `${Number(item.price).toFixed(2)}%`
            : item.symbol.startsWith("^")
            ? formatNumber(Number(item.price))
            : formatCurrency(Number(item.price))}
        </p>
        <div
          className={cn(
            "flex items-center gap-1 text-sm",
            isUp ? "text-green-600" : isDown ? "text-red-600" : "text-gray-500"
          )}
        >
          {isUp ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : isDown ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
          {displayChange} {displayAbs}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Last updated: {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
};

"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatNumber, calculatePercentageChangeV2, calculateAbsoluteChangeV2 } from "@/lib/utils";
import type { MarketData } from "@/types";
import React, { useState } from "react";

interface MarketRowPremiumProps {
  item: MarketData;
  loading?: boolean;
}

export const MarketRowPremium: React.FC<MarketRowPremiumProps> = ({ item, loading }) => {
  const [showTooltip, setShowTooltip] = useState(false);
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

  // Relative time for "Updated X mins ago"
  function getRelativeTime(dateString: string) {
    if (!dateString) return "N/A";
    const now = Date.now();
    const updated = new Date(dateString).getTime();
    const diff = Math.floor((now - updated) / 1000);
    if (diff < 60) return `Updated just now`;
    if (diff < 3600) return `Updated ${Math.floor(diff / 60)} min${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
    if (diff < 86400) return `Updated ${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
    return `Updated ${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
  }

  // Premium trading-style row UI
  return (
    <div
      className="flex items-center justify-between rounded-lg bg-white shadow-sm px-4 py-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex flex-col justify-center min-w-0">
        <span className="font-extrabold text-lg text-gray-900 tracking-wide leading-tight">{item.symbol}</span>
        <span className="text-xs text-gray-500 truncate max-w-[120px]">{item.name}</span>
      </div>
      <div className="flex flex-col items-end min-w-0">
        <span className="text-2xl font-bold text-gray-900 leading-snug">
          {item.symbol === "^TNX" || item.name.toLowerCase().includes("yield")
            ? `${Number(item.price).toFixed(2)}%`
            : item.symbol.startsWith("^")
            ? formatNumber(Number(item.price))
            : formatCurrency(Number(item.price))}
        </span>
        <span className={cn(
          "flex items-center gap-1 text-base font-medium mt-1",
          isUp ? "text-green-600" : isDown ? "text-red-600" : "text-gray-500"
        )}>
          {isUp ? (
            <span className="inline-flex items-center"><TrendingUp className="h-4 w-4 mr-0.5" />↑</span>
          ) : isDown ? (
            <span className="inline-flex items-center"><TrendingDown className="h-4 w-4 mr-0.5" />↓</span>
          ) : (
            <span className="inline-flex items-center"><Minus className="h-4 w-4 mr-0.5" />→</span>
          )}
          {displayChange} {displayAbs}
        </span>
        <span className="text-xs text-gray-400 mt-1">
          {getRelativeTime(item.lastUpdated)}
        </span>
      </div>
      {/* Tooltip with extra data */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 animate-fade-in">
          <div className="mb-1 font-semibold text-gray-900">{item.symbol} Details</div>
          <div><span className="font-medium">Name:</span> {item.name}</div>
          <div><span className="font-medium">Price:</span> {item.price}</div>
          <div><span className="font-medium">Change:</span> {displayChange} {displayAbs}</div>
          {typeof item.volume === 'number' && <div><span className="font-medium">Volume:</span> {item.volume.toLocaleString()}</div>}
          {typeof item.marketCap === 'number' && <div><span className="font-medium">Market Cap:</span> {item.marketCap.toLocaleString()}</div>}
          <div><span className="font-medium">Last updated:</span> {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "N/A"}</div>
        </div>
      )}
    </div>
  );
};

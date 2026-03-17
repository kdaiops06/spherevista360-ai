import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatNumber, formatPercent, calculatePercentageChange, calculateAbsoluteChange } from "@/lib/utils";
import { MarketRowPremium } from "./MarketRowV2";
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


export function MarketOverview({ data, isLive = false, source, lastUpdated }: MarketOverviewProps) {
  const marketStatus = getMarketStatus();
  const USE_NEW_UI = true;
  const isLoading = !data || data.length === 0;
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
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <MarketRowPremium key={i} item={{ symbol: '', name: '', price: 0, change: 0, changePercent: 0, lastUpdated: '' }} loading />)
          : data.map((item) =>
              USE_NEW_UI ? (
                <MarketRowPremium key={item.symbol} item={item} />
              ) : (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.symbol}</p>
                    <p className="text-sm text-gray-500">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatMarketValue(item)}</p>
                  </div>
                </div>
              )
            )}
      </div>
    </div>
  );
}

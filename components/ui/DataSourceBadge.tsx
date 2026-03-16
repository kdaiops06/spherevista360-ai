"use client";

import { Clock, Wifi, WifiOff } from "lucide-react";

interface DataSourceBadgeProps {
  isLive: boolean;
  source?: string;
  lastUpdated?: string;
}

export function DataSourceBadge({ isLive, source, lastUpdated }: DataSourceBadgeProps) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const fallbackLabel = source?.toLowerCase().includes("editorial")
    ? "Editorial"
    : source?.toLowerCase().includes("estimated")
    ? "Estimated"
    : source?.toLowerCase().includes("reference")
    ? "Reference Data"
    : "Illustrative Data";

  const fallbackTone = source?.toLowerCase().includes("editorial")
    ? "text-blue-600"
    : source?.toLowerCase().includes("estimated")
    ? "text-gray-600"
    : source?.toLowerCase().includes("reference")
    ? "text-slate-600"
    : "text-amber-600";

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {isLive ? (
        <>
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Wifi className="h-3 w-3" />
            Live
          </span>
          {source && <span className="text-gray-400">via {source}</span>}
        </>
      ) : (
        <span className={"flex items-center gap-1 font-medium " + fallbackTone}>
          <WifiOff className="h-3 w-3" />
          {fallbackLabel}
        </span>
      )}
      {formattedTime && (
        <span className="flex items-center gap-0.5 text-gray-400 ml-auto">
          <Clock className="h-3 w-3" />
          {formattedTime}
        </span>
      )}
    </div>
  );
}

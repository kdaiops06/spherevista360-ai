import type { WatchlistStockItem } from "@/lib/watchlist-ai/types";

export function biggestGainers(items: WatchlistStockItem[], threshold = 10): WatchlistStockItem[] {
  return [...items].filter((item) => item.changePercent >= threshold).sort((a, b) => b.changePercent - a.changePercent);
}

export function biggestLosers(items: WatchlistStockItem[], threshold = -10): WatchlistStockItem[] {
  return [...items].filter((item) => item.changePercent <= threshold).sort((a, b) => a.changePercent - b.changePercent);
}

export function unusualVolume(items: WatchlistStockItem[], minVolume: number): WatchlistStockItem[] {
  return [...items].filter((item) => item.volume >= minVolume).sort((a, b) => b.volume - a.volume);
}

export function lowDebtGrowth(items: WatchlistStockItem[]): WatchlistStockItem[] {
  return [...items]
    .filter((item) => (item.fundamentals.debtToEquity ?? Number.POSITIVE_INFINITY) <= 0.8)
    .filter((item) => (item.fundamentals.revenueGrowth ?? Number.NEGATIVE_INFINITY) >= 10)
    .sort((a, b) => (b.fundamentals.revenueGrowth ?? 0) - (a.fundamentals.revenueGrowth ?? 0));
}

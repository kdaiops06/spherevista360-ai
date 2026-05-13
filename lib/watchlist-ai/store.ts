"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WatchlistTimeframe } from "@/lib/watchlist-ai/types";

export type WatchlistSortBy =
  | "gainers"
  | "losers"
  | "highest-volume"
  | "most-volatile"
  | "strongest-ai"
  | "alphabetical"
  | "recently-added";

export type WatchlistFilter =
  | "ai-stocks"
  | "tech"
  | "etfs"
  | "crypto"
  | "bullish"
  | "bearish"
  | "alerts-only"
  | "high-momentum";

interface WatchlistState {
  timeframe: WatchlistTimeframe;
  sortBy: WatchlistSortBy;
  filters: WatchlistFilter[];
  watchlistSymbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  reorderSymbols: (activeSymbol: string, targetSymbol: string) => void;
  setTimeframe: (timeframe: WatchlistTimeframe) => void;
  setSortBy: (sortBy: WatchlistSortBy) => void;
  toggleFilter: (filter: WatchlistFilter) => void;
  clearFilters: () => void;
  setWatchlistSymbols: (symbols: string[]) => void;
}

export const WATCHLIST_SUGGESTED_TICKERS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "GOOGL",
  "AMZN",
  "META",
  "AMD",
  "NFLX",
  "PLTR",
  "BTCUSD",
  "ETHUSD",
  "SPY",
  "QQQ",
];

const defaultSymbols = ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META"];

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      timeframe: "1D",
      sortBy: "strongest-ai",
      filters: [],
      watchlistSymbols: defaultSymbols,
      addSymbol: (symbol) =>
        set((state) => {
          const normalized = symbol.trim().toUpperCase();
          if (!normalized || state.watchlistSymbols.includes(normalized)) {
            return state;
          }
          return { watchlistSymbols: [...state.watchlistSymbols, normalized] };
        }),
      removeSymbol: (symbol) =>
        set((state) => {
          const normalized = symbol.trim().toUpperCase();
          const next = state.watchlistSymbols.filter((entry) => entry !== normalized);
          if (next.length < 3) {
            return state;
          }
          return { watchlistSymbols: next };
        }),
      reorderSymbols: (activeSymbol, targetSymbol) =>
        set((state) => {
          const active = activeSymbol.trim().toUpperCase();
          const target = targetSymbol.trim().toUpperCase();
          if (!active || !target || active === target) {
            return state;
          }

          const items = [...state.watchlistSymbols];
          const fromIndex = items.indexOf(active);
          const toIndex = items.indexOf(target);
          if (fromIndex < 0 || toIndex < 0) {
            return state;
          }

          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          return { watchlistSymbols: items };
        }),
      setTimeframe: (timeframe) => set({ timeframe }),
      setSortBy: (sortBy) => set({ sortBy }),
      toggleFilter: (filter) =>
        set((state) => ({
          filters: state.filters.includes(filter)
            ? state.filters.filter((entry) => entry !== filter)
            : [...state.filters, filter],
        })),
      clearFilters: () => set({ filters: [] }),
      setWatchlistSymbols: (symbols) =>
        set({
          watchlistSymbols: Array.from(new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))),
        }),
    }),
    {
      name: "spherevista-watchlist-ai",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timeframe: state.timeframe,
        sortBy: state.sortBy,
        filters: state.filters,
        watchlistSymbols: state.watchlistSymbols,
      }),
    }
  )
);

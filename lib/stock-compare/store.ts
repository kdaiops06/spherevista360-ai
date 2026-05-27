"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ComparisonHorizon } from "@/lib/stock-compare/types";

export interface SavedComparisonSession {
  id: string;
  name: string;
  symbols: string[];
  horizon: ComparisonHorizon;
  createdAt: string;
}

interface StockCompareState {
  symbols: string[];
  horizon: ComparisonHorizon;
  sessions: SavedComparisonSession[];
  setSymbols: (symbols: string[]) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  reorderSymbols: (from: string, to: string) => void;
  setHorizon: (horizon: ComparisonHorizon) => void;
  saveSession: (name: string) => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

const defaultSymbols = ["NVDA", "AMD", "INTC"];

function normalizeSymbols(symbols: string[]): string[] {
  return Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))).slice(0, 6);
}

export const useStockCompareStore = create<StockCompareState>()(
  persist(
    (set, get) => ({
      symbols: defaultSymbols,
      horizon: "1Y",
      sessions: [
        {
          id: "default-1",
          name: "NVDA vs AMD vs INTC",
          symbols: ["NVDA", "AMD", "INTC"],
          horizon: "1Y",
          createdAt: new Date().toISOString(),
        },
        {
          id: "default-2",
          name: "TSLA vs RIVN vs F",
          symbols: ["TSLA", "RIVN", "F"],
          horizon: "6M",
          createdAt: new Date().toISOString(),
        },
        {
          id: "default-3",
          name: "MSFT vs GOOGL vs AMZN",
          symbols: ["MSFT", "GOOGL", "AMZN"],
          horizon: "1Y",
          createdAt: new Date().toISOString(),
        },
      ],
      setSymbols: (symbols) => set({ symbols: normalizeSymbols(symbols) }),
      addSymbol: (symbol) =>
        set((state) => {
          const next = normalizeSymbols([...state.symbols, symbol]);
          return { symbols: next };
        }),
      removeSymbol: (symbol) =>
        set((state) => {
          const normalized = symbol.trim().toUpperCase();
          const next = state.symbols.filter((s) => s !== normalized);
          if (next.length < 2) {
            return state;
          }
          return { symbols: next };
        }),
      reorderSymbols: (from, to) =>
        set((state) => {
          const source = from.trim().toUpperCase();
          const target = to.trim().toUpperCase();
          if (!source || !target || source === target) {
            return state;
          }
          const next = [...state.symbols];
          const fromIdx = next.indexOf(source);
          const toIdx = next.indexOf(target);
          if (fromIdx < 0 || toIdx < 0) {
            return state;
          }
          const [moved] = next.splice(fromIdx, 1);
          next.splice(toIdx, 0, moved);
          return { symbols: next };
        }),
      setHorizon: (horizon) => set({ horizon }),
      saveSession: (name) =>
        set((state) => {
          const clean = name.trim();
          if (!clean) {
            return state;
          }
          const session: SavedComparisonSession = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: clean,
            symbols: state.symbols,
            horizon: state.horizon,
            createdAt: new Date().toISOString(),
          };
          return { sessions: [session, ...state.sessions].slice(0, 20) };
        }),
      loadSession: (id) => {
        const session = get().sessions.find((s) => s.id === id);
        if (!session) {
          return;
        }
        set({ symbols: session.symbols, horizon: session.horizon });
      },
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: "spherevista-stock-compare",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        symbols: state.symbols,
        horizon: state.horizon,
        sessions: state.sessions,
      }),
    }
  )
);

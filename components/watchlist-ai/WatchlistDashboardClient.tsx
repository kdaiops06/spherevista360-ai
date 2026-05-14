"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Brain,
  CandlestickChart,
  CircleDot,
  Gauge,
  Globe,
  GripVertical,
  Plus,
  Radar,
  RefreshCw,
  Search,
  ShieldAlert,
  Signal,
  Trash2,
  TrendingUp,
  Waves,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWatchlistStore,
  type WatchlistFilter,
  WATCHLIST_SUGGESTED_TICKERS,
} from "@/lib/watchlist-ai/store";
import type { AIPrediction, MarketData } from "@/types";
import type { RecessionSignal } from "@/lib/financial-intelligence";
import type {
  CardTimeframe,
  WatchlistSnapshot,
  WatchlistStockItem,
  WatchlistTimeframe,
} from "@/lib/watchlist-ai/types";
import { InstitutionalTrendChart } from "@/components/watchlist-ai/InstitutionalTrendChart";
import { MiniLightweightChart } from "@/components/watchlist-ai/MiniLightweightChart";

interface WatchlistDashboardClientProps {
  initialSnapshot: WatchlistSnapshot;
  marketData: MarketData[];
  predictions: AIPrediction[];
  recessionSignal: RecessionSignal;
}

const filterConfig: Array<{ key: WatchlistFilter; label: string }> = [
  { key: "ai-stocks", label: "AI Stocks" },
  { key: "tech", label: "Tech" },
  { key: "etfs", label: "ETFs" },
  { key: "crypto", label: "Crypto" },
  { key: "bullish", label: "Bullish" },
  { key: "bearish", label: "Bearish" },
  { key: "alerts-only", label: "Alerts Only" },
  { key: "high-momentum", label: "High Momentum" },
];

const sortConfig = [
  { value: "gainers", label: "Biggest Gainers" },
  { value: "losers", label: "Biggest Losers" },
  { value: "highest-volume", label: "Highest Volume" },
  { value: "most-volatile", label: "Most Volatile" },
  { value: "strongest-ai", label: "Strongest AI Sentiment" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "recently-added", label: "Recently Added" },
] as const;

const timeframeOptions: WatchlistTimeframe[] = ["1D", "1W", "1M", "3M", "1Y"];
const cardTimeframes: CardTimeframe[] = ["1D", "1W", "1M", "3M"];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface ThresholdFilters {
  minGain: number;
  maxLoss: number;
  minRsi: number;
  minVolatility: number;
  maxPeRatio: number;
  maxDebtToEquity: number;
}

const defaultThresholds: ThresholdFilters = {
  minGain: -100,
  maxLoss: -100,
  minRsi: 0,
  minVolatility: 0,
  maxPeRatio: 10_000,
  maxDebtToEquity: 10_000,
};

function applyFilters(items: WatchlistStockItem[], filters: WatchlistFilter[], alertTickers: Set<string>, thresholds: ThresholdFilters) {
  return items.filter((item) => {
    for (const filter of filters) {
      if (
        filter === "ai-stocks" &&
        !(item.sector.toLowerCase().includes("semiconductor") || ["NVDA", "AMD", "MSFT", "GOOGL", "META"].includes(item.ticker))
      ) {
        return false;
      }
      if (filter === "tech" && !item.sector.toLowerCase().includes("tech") && item.sector !== "Semiconductors") {
        return false;
      }
      if (filter === "etfs" && item.assetType !== "etf") {
        return false;
      }
      if (filter === "crypto" && item.assetType !== "crypto") {
        return false;
      }
      if (filter === "bullish" && item.sentiment !== "bullish") {
        return false;
      }
      if (filter === "bearish" && item.sentiment !== "bearish") {
        return false;
      }
      if (filter === "alerts-only" && !alertTickers.has(item.ticker)) {
        return false;
      }
      if (filter === "high-momentum" && item.momentumScore < 70) {
        return false;
      }
    }

    if (item.changePercent < thresholds.minGain) {
      return false;
    }
    if (thresholds.maxLoss > -100 && item.changePercent > -Math.abs(thresholds.maxLoss)) {
      return false;
    }
    if (item.rsiScore < thresholds.minRsi) {
      return false;
    }
    if (item.volatilityScore < thresholds.minVolatility) {
      return false;
    }
    if (thresholds.maxPeRatio < 10_000 && item.fundamentals.peRatio != null && item.fundamentals.peRatio > thresholds.maxPeRatio) {
      return false;
    }
    if (
      thresholds.maxDebtToEquity < 10_000 &&
      item.fundamentals.debtToEquity != null &&
      item.fundamentals.debtToEquity > thresholds.maxDebtToEquity
    ) {
      return false;
    }

    return true;
  });
}

function applySort(items: WatchlistStockItem[], sortBy: string, watchlistSymbols: string[]) {
  const ordered = [...items];

  switch (sortBy) {
    case "gainers":
      return ordered.sort((a, b) => b.changePercent - a.changePercent);
    case "losers":
      return ordered.sort((a, b) => a.changePercent - b.changePercent);
    case "highest-volume":
      return ordered.sort((a, b) => b.volume - a.volume);
    case "most-volatile":
      return ordered.sort((a, b) => b.volatilityScore - a.volatilityScore);
    case "strongest-ai":
      return ordered.sort((a, b) => b.aiConfidence - a.aiConfidence);
    case "alphabetical":
      return ordered.sort((a, b) => a.ticker.localeCompare(b.ticker));
    case "recently-added": {
      const rankMap = new Map(watchlistSymbols.map((symbol, index) => [symbol, index]));
      return ordered.sort((a, b) => (rankMap.get(b.ticker) || 0) - (rankMap.get(a.ticker) || 0));
    }
    default:
      return ordered;
  }
}

function TimeframeRibbon({ item }: { item: WatchlistStockItem }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {cardTimeframes.map((timeframe) => {
        const insight = item.timeframeInsights[timeframe];
        const positive = insight.changePercent >= 0;
        return (
          <div key={timeframe} className="rounded-lg border border-white/10 bg-white/5 p-2">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-300">
              <span>{timeframe}</span>
              <span className={cn(positive ? "text-emerald-300" : "text-rose-300")}>
                {positive ? "+" : ""}
                {insight.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="h-8">
              <MiniLightweightChart data={insight.series} positive={positive} height={32} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WatchlistCard({
  item,
  hasAlert,
  onRemove,
  onDragStart,
  onDrop,
}: {
  item: WatchlistStockItem;
  hasAlert: boolean;
  onRemove: (symbol: string) => void;
  onDragStart: (symbol: string) => void;
  onDrop: (symbol: string) => void;
}) {
  const isPositive = item.changePercent >= 0;
  const hasCrash = item.changePercent <= -10;
  const hasVolatility = item.volatilityScore >= 80 || item.anomalyFlags.includes("volatility");
  const hasMomentumGlow = item.momentumScore >= 75;

  return (
    <motion.article
      layout
      draggable
      onDragStart={() => onDragStart(item.ticker)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(item.ticker)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative min-w-[88vw] snap-start overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all sm:min-w-[70vw] md:min-w-0",
        "bg-gradient-to-b from-[#101d38]/90 via-[#09122a]/90 to-[#050a18]/95",
        hasCrash
          ? "border-orange-300/70 shadow-[0_0_28px_rgba(251,146,60,0.35)]"
          : hasAlert
            ? "border-cyan-300/50 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
            : "border-cyan-400/20 shadow-[0_0_18px_rgba(56,189,248,0.12)]",
        hasVolatility && "before:absolute before:inset-0 before:animate-pulse before:bg-red-500/10",
        hasMomentumGlow && "after:absolute after:-right-10 after:top-0 after:h-24 after:w-24 after:rounded-full after:bg-emerald-400/20 after:blur-2xl"
      )}
    >
      <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <GripVertical className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{item.ticker}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{item.companyName}</h3>
              <p className="mt-1 text-xs text-slate-300/90">{item.sector}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={item.sentiment === "bullish" ? "success" : item.sentiment === "bearish" ? "danger" : "neutral"}>
              {item.bullishLabel.toUpperCase()}
            </Badge>
            <button
              type="button"
              onClick={() => onRemove(item.ticker)}
              className="rounded-md border border-white/20 p-1 text-slate-300 transition hover:bg-white/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <p className="text-2xl font-bold text-white">{formatCurrency(item.price)}</p>
          <p className={cn("text-sm font-semibold", isPositive ? "text-emerald-300" : "text-rose-300")}>
            {isPositive ? "+" : ""}
            {item.changePercent.toFixed(2)}%
          </p>
        </div>

        <div className="mt-3">
          <MiniLightweightChart data={item.miniSeries} positive={isPositive} height={56} />
        </div>

        <TimeframeRibbon item={item} />

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">Market Cap</span>
            <p className="mt-1 font-medium text-white">{item.marketCap ? `$${(item.marketCap / 1_000_000_000).toFixed(0)}B` : "N/A"}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">Volume</span>
            <p className="mt-1 font-medium text-white">{formatNumber(item.volume)}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">RSI</span>
            <p className="mt-1 font-medium text-white">{item.rsiScore}/100</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">Momentum</span>
            <p className="mt-1 font-medium text-white">{item.momentumScore}/100</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">P/E</span>
            <p className="mt-1 font-medium text-white">{item.fundamentals.peRatio != null ? item.fundamentals.peRatio.toFixed(2) : "N/A"}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">Debt/Equity</span>
            <p className="mt-1 font-medium text-white">{item.fundamentals.debtToEquity != null ? item.fundamentals.debtToEquity.toFixed(2) : "N/A"}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">ROE</span>
            <p className="mt-1 font-medium text-white">{item.fundamentals.roe != null ? `${item.fundamentals.roe.toFixed(1)}%` : "N/A"}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-slate-400">MACD</span>
            <p className="mt-1 font-medium text-white uppercase">{item.technicalSignals.macdTrend}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <span className="text-slate-400">Support</span>
            <p className="mt-1 font-medium text-white">{formatCurrency(item.supportZone)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <span className="text-slate-400">Resistance</span>
            <p className="mt-1 font-medium text-white">{formatCurrency(item.resistanceZone)}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Relative Strength</span>
            <span>{item.relativeStrength}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${item.relativeStrength}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-300">Volatility {item.volatilityScore}/100</span>
          <span className="inline-flex items-center gap-1 text-cyan-200">
            <CircleDot className="h-3 w-3 animate-pulse" />
            {item.realtimeUpdated ? "Realtime" : "Fallback"}
          </span>
        </div>

        <p className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-500/5 p-2 text-xs text-cyan-100/90">
          {item.aiAnalysis} Confidence: {item.aiConfidence}%. Bullish continuation probability: {item.trendContinuationProbability}%.
        </p>
      </div>
    </motion.article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-2 h-6 w-32" />
          <Skeleton className="mt-4 h-16 w-full" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricPanel({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.13em] text-slate-300">
        {icon}
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{detail}</p>
    </div>
  );
}

export function WatchlistDashboardClient({
  initialSnapshot,
  marketData,
  predictions,
  recessionSignal,
}: WatchlistDashboardClientProps) {
  const {
    timeframe,
    setTimeframe,
    sortBy,
    setSortBy,
    filters,
    toggleFilter,
    clearFilters,
    watchlistSymbols,
    addSymbol,
    removeSymbol,
    reorderSymbols,
  } = useWatchlistStore();
  const [snapshot, setSnapshot] = useState<WatchlistSnapshot>(initialSnapshot);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState("");
  const [draggedTicker, setDraggedTicker] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdFilters>(defaultThresholds);
  const [screenerWindow, setScreenerWindow] = useState<CardTimeframe>(initialSnapshot.screenerTimeframe);
  const symbolsKey = watchlistSymbols.join(",");

  const alertTickers = useMemo(() => new Set(snapshot.alerts.map((alert) => alert.ticker)), [snapshot.alerts]);

  const visibleItems = useMemo(() => {
    const filtered = applyFilters(snapshot.items, filters, alertTickers, thresholds);
    return applySort(filtered, sortBy, watchlistSymbols);
  }, [snapshot.items, filters, alertTickers, thresholds, sortBy, watchlistSymbols]);

  const breadth = useMemo(() => {
    const positive = snapshot.items.filter((item) => item.changePercent >= 0).length;
    return snapshot.items.length === 0 ? 0 : (positive / snapshot.items.length) * 100;
  }, [snapshot.items]);

  const avgVolatility = useMemo(() => {
    if (snapshot.items.length === 0) {
      return 0;
    }
    return Math.round(snapshot.items.reduce((sum, item) => sum + item.volatilityScore, 0) / snapshot.items.length);
  }, [snapshot.items]);

  const fearGreed = useMemo(() => {
    const score = Math.round(60 + (breadth - 50) * 0.65 - (avgVolatility - 40) * 0.35);
    return clamp(score, 0, 100);
  }, [breadth, avgVolatility]);

  const sectorHeatmapData = useMemo(() => {
    const sectors = new Map<string, { size: number; momentum: number }>();
    for (const item of snapshot.items) {
      const current = sectors.get(item.sector) || { size: 0, momentum: 0 };
      current.size += Math.max(1, item.marketCap ? item.marketCap / 100_000_000_000 : 2);
      current.momentum += item.momentumScore;
      sectors.set(item.sector, current);
    }

    return Array.from(sectors.entries()).map(([name, value]) => ({
      name,
      size: Number(value.size.toFixed(1)),
      momentum: Math.round(value.momentum / Math.max(1, snapshot.items.filter((item) => item.sector === name).length)),
    }));
  }, [snapshot.items]);

  const recommendationItems = useMemo(() => {
    return [...visibleItems].sort((a, b) => b.aiConfidence - a.aiConfidence).slice(0, 5);
  }, [visibleItems]);

  const topGainers = useMemo(() => [...visibleItems].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4), [visibleItems]);
  const topLosers = useMemo(() => [...visibleItems].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4), [visibleItems]);
  const bullishPicks = useMemo(
    () => [...visibleItems].filter((item) => item.sentiment === "bullish").sort((a, b) => b.aiConfidence - a.aiConfidence).slice(0, 4),
    [visibleItems]
  );
  const highVolatilityRadar = useMemo(
    () => [...visibleItems].sort((a, b) => b.volatilityScore - a.volatilityScore).slice(0, 4),
    [visibleItems]
  );

  const screened = useMemo(() => {
    const score = (item: WatchlistStockItem) => item.timeframeInsights[screenerWindow]?.changePercent ?? item.changePercent;
    return {
      gainers: [...visibleItems].filter((i) => score(i) >= 10).sort((a, b) => score(b) - score(a)).slice(0, 6),
      losers: [...visibleItems].filter((i) => score(i) <= -10).sort((a, b) => score(a) - score(b)).slice(0, 6),
    };
  }, [visibleItems, screenerWindow]);

  const fetchSnapshot = useCallback(
    async (forceRefresh = false) => {
      const params = new URLSearchParams();
      params.set("timeframe", timeframe);
      params.set("symbols", symbolsKey);
      if (forceRefresh) {
        params.set("force", "1");
      }

      const response = await fetch(`/api/watchlist-ai?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load watchlist intelligence");
      }

      const data = (await response.json()) as WatchlistSnapshot;
      setSnapshot(data);
      setError(null);
    },
    [symbolsKey, timeframe]
  );

  useEffect(() => {
    setIsLoading(true);
    fetchSnapshot(false)
      .catch(() => setError("Live watchlist feed is temporarily unavailable."))
      .finally(() => setIsLoading(false));
  }, [fetchSnapshot]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WATCHLIST_AI_STREAM !== "1") {
      const interval = setInterval(() => {
        fetchSnapshot(false).catch(() => undefined);
      }, Math.max(10, snapshot.pollIntervalSeconds) * 1000);
      return () => clearInterval(interval);
    }

    const streamUrl = `/api/watchlist-ai/stream?timeframe=${timeframe}&symbols=${symbolsKey}`;
    const source = new EventSource(streamUrl);

    source.addEventListener("snapshot", (event) => {
      try {
        const next = JSON.parse((event as MessageEvent<string>).data) as WatchlistSnapshot;
        setSnapshot(next);
      } catch {
        // Ignore malformed events.
      }
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [fetchSnapshot, snapshot.pollIntervalSeconds, symbolsKey, timeframe]);

  const majorTrend = useMemo(() => {
    const avg = snapshot.items.reduce((sum, item) => sum + item.changePercent, 0) / Math.max(1, snapshot.items.length);
    return avg;
  }, [snapshot.items]);

  const aiSentimentFeed = useMemo(
    () =>
      snapshot.items
        .slice()
        .sort((a, b) => b.aiConfidence - a.aiConfidence)
        .slice(0, 6)
        .map((item) => `${item.ticker}: ${item.aiAnalysis}`),
    [snapshot.items]
  );

  const tickerTape = useMemo(
    () =>
      snapshot.items.map((item) => ({
        label: `${item.ticker} ${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`,
        positive: item.changePercent >= 0,
      })),
    [snapshot.items]
  );

  const addTicker = () => {
    if (!newTicker.trim()) {
      return;
    }
    addSymbol(newTicker);
    setNewTicker("");
  };

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#132448_0%,#060b1d_55%,#030711_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-10 top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
          animate={{ y: [0, -16, 0], x: [0, -14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 border-b border-cyan-400/20 bg-black/25 py-2">
        <div className="overflow-hidden whitespace-nowrap">
          <motion.div
            className="inline-flex gap-8 pl-6"
            animate={{ x: [0, -900] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[...tickerTape, ...tickerTape].map((item, index) => (
              <span key={`${item.label}-${index}`} className={cn("text-xs tracking-[0.15em]", item.positive ? "text-emerald-300" : "text-rose-300")}>
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container-main relative z-10 py-8 md:py-12">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge variant="default" className="mb-3 w-fit">
                  SphereVista360 AI Watchlist Intelligence Terminal
                </Badge>
                <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
                  Hedge-Fund Grade Cinematic Market Intelligence
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-200 md:text-base">
                  Institutional side-by-side stock comparison with realtime movement, anomaly detection, AI confidence modeling,
                  and multi-timeframe momentum intelligence.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-[#071126]/80 p-4 text-sm">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Signal className="h-4 w-4" />
                  {snapshot.isLive ? "Live market feed" : "Fallback mode"}
                </div>
                <p className="mt-2 text-xs text-slate-300">Source: {snapshot.source}</p>
                <p className="text-xs text-slate-300">Updated: {new Date(snapshot.updatedAt).toLocaleTimeString()}</p>
                {snapshot.fallbackUsed && snapshot.fallbackReason ? (
                  <p className="mt-2 text-xs text-orange-300">{snapshot.fallbackReason}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {timeframeOptions.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={option === timeframe ? "default" : "secondary"}
                  onClick={() => setTimeframe(option)}
                >
                  {option}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setIsRefreshing(true);
                  fetchSnapshot(true).finally(() => setIsRefreshing(false));
                }}
              >
                <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.section>

        <section className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={newTicker}
                  onChange={(event) => setNewTicker(event.target.value.toUpperCase())}
                  list="watchlist-ticker-suggestions"
                  placeholder="Add ticker (e.g. AMD)"
                  className="w-52 rounded-lg border border-white/15 bg-[#0b1730] py-2 pl-9 pr-3 text-sm text-white outline-none"
                />
                <datalist id="watchlist-ticker-suggestions">
                  {WATCHLIST_SUGGESTED_TICKERS.map((ticker) => (
                    <option key={ticker} value={ticker} />
                  ))}
                </datalist>
              </div>
              <Button size="sm" onClick={addTicker}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
              <p className="text-xs text-slate-300">Drag cards to reorder. Remove with trash icon.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filterConfig.map((filter) => {
                const active = filters.includes(filter.key);
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => toggleFilter(filter.key)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      active
                        ? "border-emerald-300/70 bg-emerald-400/20 text-emerald-100"
                        : "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
              {filters.length > 0 ? (
                <button type="button" onClick={clearFilters} className="text-xs text-slate-300 underline-offset-2 hover:underline">
                  Clear
                </button>
              ) : null}
              <select
                className="rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as (typeof sortConfig)[number]["value"])}
              >
                {sortConfig.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs text-slate-300">
              Gain &gt; %
              <input
                type="number"
                value={thresholds.minGain}
                onChange={(e) => setThresholds((prev) => ({ ...prev, minGain: Number(e.target.value || 0) }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="text-xs text-slate-300">
              Loss &gt; %
              <input
                type="number"
                value={Math.abs(thresholds.maxLoss)}
                onChange={(e) => setThresholds((prev) => ({ ...prev, maxLoss: -Math.abs(Number(e.target.value || 0)) }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="text-xs text-slate-300">
              RSI &gt;
              <input
                type="number"
                value={thresholds.minRsi}
                onChange={(e) => setThresholds((prev) => ({ ...prev, minRsi: Number(e.target.value || 0) }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="text-xs text-slate-300">
              Volatility &gt;
              <input
                type="number"
                value={thresholds.minVolatility}
                onChange={(e) => setThresholds((prev) => ({ ...prev, minVolatility: Number(e.target.value || 0) }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="text-xs text-slate-300">
              P/E &lt;
              <input
                type="number"
                value={thresholds.maxPeRatio >= 10000 ? "" : thresholds.maxPeRatio}
                onChange={(e) => setThresholds((prev) => ({ ...prev, maxPeRatio: e.target.value ? Number(e.target.value) : 10000 }))}
                placeholder="Any"
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="text-xs text-slate-300">
              Debt/Equity &lt;
              <input
                type="number"
                value={thresholds.maxDebtToEquity >= 10000 ? "" : thresholds.maxDebtToEquity}
                onChange={(e) => setThresholds((prev) => ({ ...prev, maxDebtToEquity: e.target.value ? Number(e.target.value) : 10000 }))}
                placeholder="Any"
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0b1730] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white md:text-2xl">Realtime Side-by-Side Intelligence Grid</h2>
            <span className="text-sm text-slate-300">{visibleItems.length} assets</span>
          </div>

          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:overflow-visible md:snap-none md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <WatchlistCard
                  key={item.ticker}
                  item={item}
                  hasAlert={alertTickers.has(item.ticker)}
                  onRemove={removeSymbol}
                  onDragStart={(symbol) => setDraggedTicker(symbol)}
                  onDrop={(symbol) => {
                    if (draggedTicker) {
                      reorderSymbols(draggedTicker, symbol);
                    }
                  }}
                />
              ))}
            </div>
          )}
          {error ? <p className="mt-3 text-sm text-orange-300">{error}</p> : null}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.riskSignals.map((signal) => (
            <MetricPanel
              key={signal.label}
              title={signal.label}
              value={`${signal.score}/100`}
              detail={signal.detail}
              icon={<ShieldAlert className="h-3.5 w-3.5 text-cyan-300" />}
            />
          ))}
          <MetricPanel
            title="Fear & Greed Index"
            value={`${fearGreed}/100`}
            detail="Composite risk-on/risk-off model from breadth + volatility."
            icon={<Gauge className="h-3.5 w-3.5 text-cyan-300" />}
          />
          <MetricPanel
            title="Market Breadth"
            value={`${breadth.toFixed(1)}%`}
            detail="Percent of monitored symbols trading green."
            icon={<Activity className="h-3.5 w-3.5 text-cyan-300" />}
          />
          <MetricPanel
            title="Liquidity Tracker"
            value={formatNumber(Math.round(snapshot.items.reduce((sum, item) => sum + item.volume, 0) / Math.max(snapshot.items.length, 1)))}
            detail="Average traded volume across the active watchlist."
            icon={<Waves className="h-3.5 w-3.5 text-cyan-300" />}
          />
          <MetricPanel
            title="Realtime Market Pulse"
            value={majorTrend >= 0 ? "Risk-On" : "Risk-Off"}
            detail="AI synthesis from aggregate intraday directional drift."
            icon={<Signal className="h-3.5 w-3.5 text-cyan-300" />}
          />
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp className="h-5 w-5 text-emerald-300" />Top Gainers</h3>
            <div className="mt-3 space-y-2">
              {topGainers.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span>{stock.ticker}</span>
                  <span className="text-emerald-300">+{stock.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><ArrowDown className="h-5 w-5 text-rose-300" />Top Losers</h3>
            <div className="mt-3 space-y-2">
              {topLosers.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span>{stock.ticker}</span>
                  <span className="text-rose-300">{stock.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Brain className="h-5 w-5 text-cyan-300" />AI Bullish Picks</h3>
            <div className="mt-3 space-y-2">
              {bullishPicks.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span>{stock.ticker}</span>
                  <span className="text-cyan-200">{stock.aiConfidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-cyan-300" />
              Advanced Stock Screeners
            </h3>
            <div className="flex gap-2">
              {(["1D", "1W", "1M", "3M"] as CardTimeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setScreenerWindow(tf)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    screenerWindow === tf ? "border-cyan-300 bg-cyan-500/20 text-cyan-100" : "border-white/15 text-slate-300"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-200">Biggest Gainers (&gt;10%)</p>
              <div className="mt-2 space-y-2 text-sm">
                {screened.gainers.length ? screened.gainers.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <span>{stock.ticker}</span>
                    <span className="text-emerald-200">+{stock.timeframeInsights[screenerWindow].changePercent.toFixed(2)}%</span>
                  </div>
                )) : <p className="text-slate-300">No gainers above threshold.</p>}
              </div>
            </div>
            <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-4">
              <p className="text-sm font-semibold text-rose-200">Biggest Losers (&gt;10% down)</p>
              <div className="mt-2 space-y-2 text-sm">
                {screened.losers.length ? screened.losers.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <span>{stock.ticker}</span>
                    <span className="text-rose-200">{stock.timeframeInsights[screenerWindow].changePercent.toFixed(2)}%</span>
                  </div>
                )) : <p className="text-slate-300">No losers above threshold.</p>}
              </div>
            </div>
            <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4">
              <p className="text-sm font-semibold text-cyan-100">AI Bearish Warnings</p>
              <div className="mt-2 space-y-2 text-sm">
                {(snapshot.screeners.aiBearishWarnings.length ? snapshot.screeners.aiBearishWarnings : topLosers).slice(0, 6).map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <span>{stock.ticker}</span>
                    <span className="text-cyan-200">{stock.bearishProbability}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {snapshot.smartPanels.slice(0, 6).map((panel) => (
              <div key={panel.title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{panel.title}</p>
                <p className="mt-1 text-xs text-slate-300">{panel.description}</p>
                <div className="mt-2 space-y-1 text-sm">
                  {panel.items.slice(0, 4).map((item) => (
                    <div key={item.ticker} className="flex items-center justify-between text-slate-200">
                      <span>{item.ticker}</span>
                      <span>{item.momentumScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Side-by-Side Fundamental + Momentum Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="px-2 py-2">Ticker</th>
                  <th className="px-2 py-2">1W %</th>
                  <th className="px-2 py-2">Momentum</th>
                  <th className="px-2 py-2">Volatility</th>
                  <th className="px-2 py-2">P/E</th>
                  <th className="px-2 py-2">Debt/Equity</th>
                  <th className="px-2 py-2">RSI</th>
                  <th className="px-2 py-2">AI Sentiment</th>
                  <th className="px-2 py-2">Bullish %</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.slice(0, 12).map((item) => (
                  <tr key={item.ticker} className="border-b border-white/5">
                    <td className="px-2 py-2 font-semibold text-white">{item.ticker}</td>
                    <td className={cn("px-2 py-2", item.timeframeInsights["1W"].changePercent >= 0 ? "text-emerald-300" : "text-rose-300")}>
                      {item.timeframeInsights["1W"].changePercent.toFixed(2)}%
                    </td>
                    <td className="px-2 py-2">{item.momentumScore}</td>
                    <td className="px-2 py-2">{item.volatilityScore}</td>
                    <td className="px-2 py-2">{item.fundamentals.peRatio != null ? item.fundamentals.peRatio.toFixed(1) : "N/A"}</td>
                    <td className="px-2 py-2">{item.fundamentals.debtToEquity != null ? item.fundamentals.debtToEquity.toFixed(2) : "N/A"}</td>
                    <td className="px-2 py-2">{item.rsiScore}</td>
                    <td className="px-2 py-2 uppercase">{item.sentiment}</td>
                    <td className="px-2 py-2">{item.bullishProbability}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Radar className="h-5 w-5 text-orange-300" />High Volatility Radar</h3>
            <div className="mt-3 space-y-2">
              {highVolatilityRadar.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span>{stock.ticker}</span>
                  <span className="text-orange-300">{stock.volatilityScore}/100</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><CandlestickChart className="h-5 w-5 text-cyan-300" />Sector Rotation Heatmap</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {sectorHeatmapData.map((sector) => (
                <div
                  key={sector.name}
                  className={cn(
                    "rounded-lg border p-3",
                    sector.momentum > 65
                      ? "border-emerald-300/40 bg-emerald-500/20"
                      : sector.momentum > 45
                        ? "border-cyan-300/40 bg-cyan-500/20"
                        : "border-orange-300/40 bg-orange-500/20"
                  )}
                >
                  <p className="text-sm font-semibold text-white">{sector.name}</p>
                  <p className="mt-1 text-xs text-slate-200">Momentum {sector.momentum}</p>
                  <p className="text-xs text-slate-300">Weight {sector.size.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Globe className="h-5 w-5 text-cyan-300" />Global Market Pulse + Institutional Trend</h3>
            <div className="mt-4">
              <InstitutionalTrendChart items={visibleItems.length > 0 ? visibleItems : snapshot.items} timeframeLabel={timeframe} />
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {marketData.slice(0, 3).map((item) => (
                <div key={item.symbol} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="text-slate-300">{item.symbol}</p>
                  <p className="font-semibold text-white">{formatCurrency(item.price)}</p>
                  <p className={cn(item.changePercent >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {item.changePercent >= 0 ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><ShieldAlert className="h-5 w-5 text-orange-300" />Macro Risk Signals</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-300">Recession Probability</p>
                <p className="text-xl font-semibold text-white">{recessionSignal.probability}/100</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-300">Economic Indicators</p>
                <p className="text-xl font-semibold text-white">{majorTrend >= 0 ? "Expansionary Drift" : "Defensive Drift"}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-300">AI Risk Radar</p>
                <p className="text-xl font-semibold text-white">{avgVolatility}/100</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-300">Volatility Forecasting</p>
                <p className="text-xl font-semibold text-white">{avgVolatility > 65 ? "High Regime" : "Moderate Regime"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="h-5 w-5 text-orange-300" />Alert Summary Center</h3>
            <div className="mt-4 space-y-3">
              {snapshot.alerts.length === 0 ? (
                <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  No active major alerts. Realtime monitor is running.
                </p>
              ) : (
                snapshot.alerts.slice(0, 8).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "rounded-lg border p-3",
                      alert.severity === "critical"
                        ? "border-red-400/45 bg-red-500/15"
                        : "border-orange-400/35 bg-orange-500/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-orange-100">{alert.title}</p>
                        <p className="mt-1 text-sm text-orange-200/90">{alert.message}</p>
                      </div>
                      <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>{alert.type}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Brain className="h-5 w-5 text-emerald-300" />AI Sentiment Feed</h3>
            <div className="mt-4 space-y-3">
              {aiSentimentFeed.map((line, index) => (
                <motion.div
                  key={`${line}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 p-3 text-sm text-slate-200"
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Activity className="h-5 w-5 text-emerald-300" />Portfolio Insights + AI Recommendation Engine</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Average AI Confidence</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {Math.round(snapshot.items.reduce((sum, item) => sum + item.aiConfidence, 0) / Math.max(1, snapshot.items.length))}%
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Bullish Allocation</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {Math.round((snapshot.items.filter((item) => item.sentiment === "bullish").length / Math.max(1, snapshot.items.length)) * 100)}%
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Active Alerts</p>
              <p className="mt-2 text-2xl font-bold text-white">{snapshot.alerts.length}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {recommendationItems.map((item) => (
              <div key={item.ticker} className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{item.ticker}</span>
                  <span className="text-cyan-200">{item.aiConfidence}%</span>
                </div>
                <p className="mt-2 text-xs text-slate-200">{item.aiAnalysis}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">AI Commentary</p>
            <p className="mt-2">
              {majorTrend >= 0
                ? "Bullish accumulation detected in core mega-cap basket. Trend continuation probability remains elevated while volatility stays below panic threshold."
                : "Distribution pressure rising across leadership names. Recovery probability improves only if market breadth regains positive territory and volatility cools."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

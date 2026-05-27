"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Building2,
  ChevronRight,
  Layers,
  Plus,
  RefreshCw,
  Save,
  Scale,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { UTCTimestamp } from "lightweight-charts";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { useStockCompareStore } from "@/lib/stock-compare/store";
import type { ComparisonHorizon, ComparisonSnapshot, ComparisonStock } from "@/lib/stock-compare/types";
import { WATCHLIST_SUGGESTED_TICKERS } from "@/lib/watchlist-ai/store";
import { MiniLightweightChart } from "@/components/watchlist-ai/MiniLightweightChart";

const horizons: ComparisonHorizon[] = ["1W", "1M", "3M", "6M", "1Y", "3Y", "LONG"];

type CompareFilter =
  | "growth"
  | "value"
  | "ai-sector"
  | "low-debt"
  | "high-roe"
  | "undervalued"
  | "high-momentum"
  | "low-volatility"
  | "strong-cashflow";

const filterLabels: Record<CompareFilter, string> = {
  growth: "Growth Stocks",
  value: "Value",
  "ai-sector": "AI Sector",
  "low-debt": "Low Debt",
  "high-roe": "High ROE",
  undervalued: "Undervalued",
  "high-momentum": "High Momentum",
  "low-volatility": "Low Volatility",
  "strong-cashflow": "Strong Cash Flow",
};

function normalizeSeriesForOverlay(items: ComparisonStock[], horizon: ComparisonHorizon) {
  const horizonKey = horizon === "1W" || horizon === "1M" || horizon === "3M" ? horizon : "3M";
  return items.map((item) => {
    const series = horizonKey in item.priceSeries ? item.priceSeries[horizonKey as "1W" | "1M" | "3M"] : item.longSeries;
    const base = series[0] || item.price;
    const normalized = series.map((v) => Number((((v / Math.max(base, 0.01)) - 1) * 100).toFixed(2)));
    return { ticker: item.ticker, values: normalized };
  });
}

function OverlayComparisonChart({ items, horizon }: { items: ComparisonStock[]; horizon: ComparisonHorizon }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const normalized = useMemo(() => normalizeSeriesForOverlay(items, horizon), [items, horizon]);

  useEffect(() => {
    if (!ref.current || normalized.length === 0) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      const lightweight = await import("lightweight-charts");
      if (disposed || !ref.current) {
        return;
      }

      const chart = lightweight.createChart(ref.current, {
        width: ref.current.clientWidth,
        height: 320,
        layout: {
          textColor: "#cbd5e1",
          background: { type: lightweight.ColorType.Solid, color: "#071126" },
        },
        grid: {
          vertLines: { color: "rgba(148,163,184,0.12)" },
          horzLines: { color: "rgba(148,163,184,0.12)" },
        },
        rightPriceScale: { borderColor: "rgba(148,163,184,0.2)" },
        timeScale: { borderColor: "rgba(148,163,184,0.2)", timeVisible: true, secondsVisible: false },
        crosshair: {
          vertLine: { color: "rgba(34,211,238,0.4)" },
          horzLine: { color: "rgba(34,211,238,0.4)" },
        },
      });

      const palette = ["#22d3ee", "#60a5fa", "#f59e0b", "#34d399", "#f472b6", "#a78bfa"];
      const now = Math.floor(Date.now() / 1000);

      normalized.forEach((series, idx) => {
        const line = chart.addSeries(lightweight.LineSeries, {
          color: palette[idx % palette.length],
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
          title: series.ticker,
        });

        line.setData(
          series.values.map((value, index) => ({
            time: (now - (series.values.length - index) * 3600) as UTCTimestamp,
            value,
          }))
        );
      });

      chart.timeScale().fitContent();

      const resize = new ResizeObserver(() => {
        if (ref.current) {
          chart.applyOptions({ width: ref.current.clientWidth });
        }
      });
      resize.observe(ref.current);

      cleanup = () => {
        resize.disconnect();
        chart.remove();
      };
    };

    setup();

    return () => {
      disposed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }, [normalized]);

  return <div ref={ref} className="h-[320px] w-full rounded-xl border border-cyan-400/20" />;
}

function passesFilter(item: ComparisonStock, filter: CompareFilter): boolean {
  switch (filter) {
    case "growth":
      return (item.fundamentals.revenueGrowth ?? 0) > 10;
    case "value":
      return item.valuation.aiUndervaluedScore >= 60;
    case "ai-sector":
      return ["NVDA", "AMD", "MSFT", "GOOGL", "META"].includes(item.ticker) || item.sector.toLowerCase().includes("semi");
    case "low-debt":
      return (item.fundamentals.debtToEquity ?? 9) < 0.8;
    case "high-roe":
      return (item.fundamentals.roe ?? 0) > 18;
    case "undervalued":
      return item.valuation.label === "undervalued";
    case "high-momentum":
      return item.technical.momentum >= 70;
    case "low-volatility":
      return item.technical.volatility <= 45;
    case "strong-cashflow":
      return item.fundamentals.freeCashFlow != null && item.fundamentals.freeCashFlow > 0;
    default:
      return true;
  }
}

function ScoreBar({ value, good = true }: { value: number; good?: boolean }) {
  return (
    <div className="h-2 rounded-full bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.45 }}
        className={cn("h-2 rounded-full", good ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : "bg-gradient-to-r from-rose-400 to-orange-400")}
      />
    </div>
  );
}

function RadarPanel({ item }: { item: ComparisonStock }) {
  const data = [
    { metric: "Growth", value: item.ai.growthProbability },
    { metric: "Valuation", value: item.valuation.aiUndervaluedScore },
    { metric: "Momentum", value: item.technical.momentum },
    { metric: "Risk", value: 100 - item.risk.aiRiskScore },
    { metric: "Quality", value: item.financialHealthScore },
  ];

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.3)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
          <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.28} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StockComparisonIntelligence({ initialSnapshot }: { initialSnapshot: ComparisonSnapshot }) {
  const {
    symbols,
    horizon,
    sessions,
    addSymbol,
    removeSymbol,
    reorderSymbols,
    setHorizon,
    saveSession,
    loadSession,
    deleteSession,
  } = useStockCompareStore();

  const [snapshot, setSnapshot] = useState<ComparisonSnapshot>(initialSnapshot);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<CompareFilter[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (symbols.length < 2) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/stock-compare?symbols=${encodeURIComponent(symbolsKey)}&horizon=${horizon}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load comparison snapshot");
        }
        const data = (await res.json()) as ComparisonSnapshot;
        if (!cancelled) {
          setSnapshot(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Comparison engine feed unavailable. Try refresh.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symbolsKey, horizon, symbols.length]);

  useEffect(() => {
    if (symbols.length < 2) {
      return;
    }
    const id = setInterval(() => {
      fetch(`/api/stock-compare?symbols=${encodeURIComponent(symbolsKey)}&horizon=${horizon}`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setSnapshot(data as ComparisonSnapshot);
          }
        })
        .catch(() => undefined);
    }, 25_000);

    return () => clearInterval(id);
  }, [symbols.length, symbolsKey, horizon]);

  const visibleItems = useMemo(() => {
    if (activeFilters.length === 0) {
      return snapshot.items;
    }
    return snapshot.items.filter((item) => activeFilters.every((filter) => passesFilter(item, filter)));
  }, [snapshot.items, activeFilters]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/stock-compare?symbols=${encodeURIComponent(symbolsKey)}&horizon=${horizon}&force=1`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("refresh_failed");
      }
      const data = (await res.json()) as ComparisonSnapshot;
      setSnapshot(data);
      setError(null);
    } catch {
      setError("Unable to refresh live comparison feed.");
    } finally {
      setRefreshing(false);
    }
  };

  const addTicker = () => {
    if (!search.trim()) {
      return;
    }
    addSymbol(search.trim().toUpperCase());
    setSearch("");
  };

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#14315f_0%,#081126_45%,#030711_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-10 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-16 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="container-main relative z-10 py-10">
        <section className="rounded-3xl border border-cyan-300/20 bg-white/5 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                AI Stock Comparison Intelligence Engine
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                Institutional-Grade Side-by-Side Equity Intelligence
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-200 md:text-base">
                Compare 2-6 stocks across fundamentals, valuation, risk, momentum, and AI investment outlook with horizon-aware recommendations.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-300/30 bg-[#071126]/70 p-4 text-sm text-slate-200">
              <p className="font-semibold text-cyan-100">{snapshot.isLive ? "Live Data" : "Fallback Mode"}</p>
              <p className="mt-1">Source: {snapshot.source}</p>
              <p>Updated: {new Date(snapshot.updatedAt).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="flex flex-wrap items-center gap-2">
              {horizons.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    horizon === h ? "border-cyan-300 bg-cyan-500/20 text-cyan-100" : "border-white/20 text-slate-300"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                list="stock-compare-suggest"
                placeholder="Add ticker (2-6 stocks)"
                className="w-52 rounded-lg border border-white/20 bg-[#0a1835] px-3 py-2 text-sm text-white outline-none"
              />
              <datalist id="stock-compare-suggest">
                {WATCHLIST_SUGGESTED_TICKERS.map((ticker) => (
                  <option key={ticker} value={ticker} />
                ))}
                <option value="INTC" />
                <option value="RIVN" />
                <option value="F" />
                <option value="TCS.NS" />
                <option value="INFY.NS" />
                <option value="WIPRO.NS" />
              </datalist>
              <button
                type="button"
                onClick={addTicker}
                className="inline-flex items-center rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </button>

              {symbols.map((symbol) => (
                <div
                  key={symbol}
                  draggable
                  onDragStart={() => setDragging(symbol)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragging) {
                      reorderSymbols(dragging, symbol);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs"
                >
                  <span className="cursor-move">{symbol}</span>
                  <button type="button" onClick={() => removeSymbol(symbol)} className="text-slate-200 hover:text-white">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Session name"
                className="w-36 rounded-lg border border-white/20 bg-[#0a1835] px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  saveSession(sessionName || `${symbols.join(" vs ")} (${horizon})`);
                  setSessionName("");
                }}
                className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
              >
                <Save className="mr-1 h-3.5 w-3.5" /> Save
              </button>
              <select
                onChange={(e) => e.target.value && loadSession(e.target.value)}
                className="rounded-lg border border-white/20 bg-[#0a1835] px-3 py-2 text-xs text-white outline-none"
                value=""
              >
                <option value="">Load session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {sessions.length > 0 ? (
                <button
                  type="button"
                  onClick={() => deleteSession(sessions[0].id)}
                  className="rounded-lg border border-white/20 bg-white/5 px-2 py-2 text-xs hover:bg-white/10"
                >
                  Delete latest
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as CompareFilter[]).map((key) => {
              const active = activeFilters.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setActiveFilters((prev) =>
                      prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    active ? "border-emerald-300 bg-emerald-500/20 text-emerald-100" : "border-white/20 text-slate-300"
                  )}
                >
                  {filterLabels[key]}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-[#071126]/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Normalized Relative Performance Overlay ({horizon})</h2>
            <span className="text-xs text-slate-300">Drawdown + trend divergence visible</span>
          </div>
          <OverlayComparisonChart items={visibleItems} horizon={horizon} />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoMetric title="Growth Leader" value={snapshot.rankings.growthPotential[0]?.ticker || "-"} icon={<TrendingUp className="h-4 w-4 text-emerald-300" />} detail={snapshot.recommendations.shortTerm} />
          <InfoMetric title="Best Risk/Reward" value={snapshot.rankings.riskReward[0]?.ticker || "-"} icon={<Scale className="h-4 w-4 text-cyan-300" />} detail={snapshot.recommendations.mediumTerm} />
          <InfoMetric title="Long-Term Winner" value={snapshot.rankings.sectorLeadership[0]?.ticker || "-"} icon={<Building2 className="h-4 w-4 text-indigo-300" />} detail={snapshot.recommendations.longTerm} />
          <InfoMetric title="Risk Alert" value={snapshot.rankings.riskReward.at(-1)?.ticker || "-"} icon={<AlertTriangle className="h-4 w-4 text-rose-300" />} detail={snapshot.recommendations.riskWarning} />
        </section>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(loading ? [] : visibleItems).map((item) => (
            <motion.article
              key={item.ticker}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1c3f]/85 via-[#08142f]/90 to-[#050b1a]/95 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.ticker}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.companyName}</h3>
                  <p className="text-xs text-slate-300">{item.sector}</p>
                </div>
                <div className={cn("text-right", item.dayChangePercent >= 0 ? "text-emerald-300" : "text-rose-300")}>
                  <p className="text-xl font-bold text-white">{formatCurrency(item.price)}</p>
                  <p className="text-sm">{item.dayChangePercent >= 0 ? "+" : ""}{item.dayChangePercent.toFixed(2)}%</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200">
                <MetricCell label="Volatility" value={`${item.technical.volatility}/100`} />
                <MetricCell label="Momentum" value={`${item.technical.momentum}/100`} />
                <MetricCell label="RSI" value={`${item.technical.rsi}`} />
                <MetricCell label="MACD" value={item.technical.macdTrend.toUpperCase()} />
                <MetricCell label="P/E" value={item.fundamentals.peRatio != null ? item.fundamentals.peRatio.toFixed(2) : "N/A"} />
                <MetricCell label="Debt/Equity" value={item.fundamentals.debtToEquity != null ? item.fundamentals.debtToEquity.toFixed(2) : "N/A"} />
                <MetricCell label="ROE" value={item.fundamentals.roe != null ? `${item.fundamentals.roe.toFixed(1)}%` : "N/A"} />
                <MetricCell label="Dividend" value={item.fundamentals.dividendYield != null ? `${item.fundamentals.dividendYield.toFixed(2)}%` : "N/A"} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["1D", "1W", "1M", "3M"] as const).map((tf) => {
                  const series = item.priceSeries[tf];
                  const first = series[0] || item.price;
                  const last = series[series.length - 1] || first;
                  const positive = last >= first;
                  const change = first > 0 ? ((last - first) / first) * 100 : 0;
                  return (
                    <div key={`${item.ticker}-${tf}`} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="mb-1 flex items-center justify-between text-[10px] text-slate-300">
                        <span>{tf}</span>
                        <span className={cn(positive ? "text-emerald-300" : "text-rose-300")}>{change.toFixed(2)}%</span>
                      </div>
                      <MiniLightweightChart data={series} positive={positive} height={38} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-200">
                <div>
                  <div className="mb-1 flex justify-between"><span>AI Confidence</span><span>{item.ai.confidence}%</span></div>
                  <ScoreBar value={item.ai.confidence} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between"><span>Growth Probability</span><span>{item.ai.growthProbability}%</span></div>
                  <ScoreBar value={item.ai.growthProbability} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between"><span>AI Risk Score</span><span>{item.risk.aiRiskScore}%</span></div>
                  <ScoreBar value={item.risk.aiRiskScore} good={false} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-2">
                <p className="text-xs font-semibold text-cyan-100">{item.ai.summary}</p>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                  {item.ai.highlights.slice(0, 3).map((line) => (
                    <li key={line} className="flex items-start gap-1"><ChevronRight className="mt-0.5 h-3 w-3 text-cyan-300" />{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <RadarPanel item={item} />
              </div>
            </motion.article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <Layers className="h-5 w-5 text-cyan-300" />
            Institutional Ranking Modules
          </h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <RankingList title="Growth Potential" items={snapshot.rankings.growthPotential} accessor={(i) => `${i.ai.growthProbability}%`} />
            <RankingList title="Valuation Opportunity" items={snapshot.rankings.valuation} accessor={(i) => `${i.valuation.aiUndervaluedScore}/100`} />
            <RankingList title="Risk vs Reward" items={snapshot.rankings.riskReward} accessor={(i) => `${i.ai.growthProbability - i.risk.aiRiskScore}`} />
            <RankingList title="Financial Health" items={snapshot.rankings.financialHealth} accessor={(i) => `${i.financialHealthScore}/100`} />
            <RankingList title="AI Bullish Probability" items={snapshot.rankings.aiBullish} accessor={(i) => `${i.ai.suitabilityByHorizon[horizon]}%`} />
            <RankingList title="Sector Leadership" items={snapshot.rankings.sectorLeadership} accessor={(i) => `${i.leadershipScore}/100`} />
            <RankingList title="Institutional Confidence" items={snapshot.rankings.institutionalConfidence} accessor={(i) => `${i.institutionalConfidence}/100`} />
            <RankingList title="Earnings Momentum" items={snapshot.rankings.earningsMomentum} accessor={(i) => `${i.earningsMomentumScore}/100`} />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <Brain className="h-5 w-5 text-cyan-300" />
            AI Recommendation System
          </h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <RecoCard title="Short Term" text={snapshot.recommendations.shortTerm} icon={<Activity className="h-4 w-4 text-emerald-300" />} />
            <RecoCard title="Medium Term" text={snapshot.recommendations.mediumTerm} icon={<BarChart3 className="h-4 w-4 text-cyan-300" />} />
            <RecoCard title="Long Term" text={snapshot.recommendations.longTerm} icon={<TrendingUp className="h-4 w-4 text-indigo-300" />} />
            <RecoCard title="Risk Warning" text={snapshot.recommendations.riskWarning} icon={<Shield className="h-4 w-4 text-rose-300" />} />
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoMetric({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-slate-300">{icon}{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{detail}</p>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <p className="text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-white">{value}</p>
    </div>
  );
}

function RankingList({ title, items, accessor }: { title: string; items: ComparisonStock[]; accessor: (item: ComparisonStock) => string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-200">
        {items.slice(0, 4).map((item) => (
          <div key={`${title}-${item.ticker}`} className="flex items-center justify-between">
            <span>{item.ticker}</span>
            <span>{accessor(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecoCard({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">{icon}{title}</p>
      <p className="mt-2 text-sm text-slate-200">{text}</p>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import type { WatchlistStockItem } from "@/lib/watchlist-ai/types";
import type { UTCTimestamp } from "lightweight-charts";

interface InstitutionalTrendChartProps {
  items: WatchlistStockItem[];
  timeframeLabel: string;
}

function buildCompositeSeries(items: WatchlistStockItem[]): Array<{ time: UTCTimestamp; value: number }> {
  const maxPoints = Math.max(...items.map((item) => item.miniSeries.length), 0);
  if (maxPoints < 2) {
    return [];
  }

  const now = Math.floor(Date.now() / 1000);
  const step = 60 * 30;
  const values: Array<{ time: UTCTimestamp; value: number }> = [];

  for (let index = 0; index < maxPoints; index += 1) {
    const samples = items
      .map((item) => item.miniSeries[index])
      .filter((entry): entry is number => typeof entry === "number" && Number.isFinite(entry));

    if (samples.length === 0) {
      continue;
    }

    const average = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
    values.push({
      time: (now - (maxPoints - index) * step) as UTCTimestamp,
      value: Number(average.toFixed(2)),
    });
  }

  return values;
}

export function InstitutionalTrendChart({ items, timeframeLabel }: InstitutionalTrendChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const seriesData = useMemo(() => buildCompositeSeries(items), [items]);

  useEffect(() => {
    if (!containerRef.current || seriesData.length < 2) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const initialize = async () => {
      const lightweight = await import("lightweight-charts");
      if (!containerRef.current || disposed) {
        return;
      }

      const chart = lightweight.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 260,
        layout: {
          textColor: "#dbeafe",
          background: {
            type: lightweight.ColorType.Solid,
            color: "#0a152d",
          },
        },
        grid: {
          vertLines: { color: "rgba(148, 163, 184, 0.12)" },
          horzLines: { color: "rgba(148, 163, 184, 0.12)" },
        },
        rightPriceScale: {
          borderColor: "rgba(148, 163, 184, 0.2)",
        },
        timeScale: {
          borderColor: "rgba(148, 163, 184, 0.2)",
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          vertLine: { color: "rgba(34, 211, 238, 0.35)" },
          horzLine: { color: "rgba(34, 211, 238, 0.35)" },
        },
      });

      const areaSeries = chart.addSeries(lightweight.AreaSeries, {
        topColor: "rgba(34, 211, 238, 0.35)",
        bottomColor: "rgba(34, 211, 238, 0.02)",
        lineColor: "#22d3ee",
        lineWidth: 2,
      });

      areaSeries.setData(seriesData);
      chart.timeScale().fitContent();

      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current) {
          return;
        }
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      });

      resizeObserver.observe(containerRef.current);

      cleanup = () => {
        resizeObserver.disconnect();
        chart.remove();
      };
    };

    initialize();

    return () => {
      disposed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }, [seriesData]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
        <span>Composite Watchlist Trend</span>
        <span>{timeframeLabel}</span>
      </div>
      <div ref={containerRef} className="h-[260px] w-full overflow-hidden rounded-xl border border-cyan-400/20" />
    </div>
  );
}

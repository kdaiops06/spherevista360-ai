"use client";

import { useEffect, useRef } from "react";
import type { UTCTimestamp } from "lightweight-charts";

interface MiniLightweightChartProps {
  data: number[];
  positive: boolean;
  height?: number;
}

export function MiniLightweightChart({ data, positive, height = 56 }: MiniLightweightChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length < 2) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      const lightweight = await import("lightweight-charts");
      if (!containerRef.current || disposed) {
        return;
      }

      const chart = lightweight.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: {
          textColor: "#cbd5e1",
          background: {
            type: lightweight.ColorType.Solid,
            color: "transparent",
          },
        },
        grid: {
          vertLines: { color: "rgba(148,163,184,0.08)" },
          horzLines: { color: "rgba(148,163,184,0.08)" },
        },
        rightPriceScale: {
          visible: false,
        },
        leftPriceScale: {
          visible: false,
        },
        timeScale: {
          borderVisible: false,
          timeVisible: false,
          ticksVisible: false,
          secondsVisible: false,
        },
        crosshair: {
          mode: lightweight.CrosshairMode.Normal,
          vertLine: { color: "rgba(56,189,248,0.4)" },
          horzLine: { color: "rgba(56,189,248,0.4)" },
        },
        handleScale: false,
        handleScroll: false,
      });

      const series = chart.addSeries(lightweight.AreaSeries, {
        topColor: positive ? "rgba(34,197,94,0.35)" : "rgba(251,113,133,0.35)",
        bottomColor: positive ? "rgba(34,197,94,0.04)" : "rgba(251,113,133,0.04)",
        lineColor: positive ? "#22c55e" : "#fb7185",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const now = Math.floor(Date.now() / 1000);
      const points = data.map((value, index) => ({
        time: (now - (data.length - index) * 60) as UTCTimestamp,
        value,
      }));

      series.setData(points);
      chart.timeScale().fitContent();

      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      });
      resizeObserver.observe(containerRef.current);

      cleanup = () => {
        resizeObserver.disconnect();
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
  }, [data, positive, height]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}

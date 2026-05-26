import { ArrowUpRight, ArrowDownRight, Minus, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarketPulseItem {
  label: string;
  value: string;
  detail: string;
  trend: "up" | "down" | "stable";
  tone: "positive" | "negative" | "neutral";
  sourceLabel: string;
}

interface MarketPulseProps {
  items: MarketPulseItem[];
}

function getSparklinePoints(trend: MarketPulseItem["trend"]) {
  if (trend === "up") {
    return "0,26 14,24 28,23 42,20 56,17 70,12 84,8 98,6";
  }

  if (trend === "down") {
    return "0,6 14,8 28,11 42,14 56,18 70,21 84,24 98,26";
  }

  return "0,16 14,15 28,16 42,15 56,16 70,15 84,16 98,15";
}

function getToneClasses(tone: MarketPulseItem["tone"]) {
  if (tone === "positive") {
    return {
      badge: "border-emerald-400/35 bg-emerald-500/12 text-emerald-300",
      line: "#10B981",
    };
  }

  if (tone === "negative") {
    return {
      badge: "border-rose-400/35 bg-rose-500/12 text-rose-300",
      line: "#EF4444",
    };
  }

  return {
    badge: "border-slate-400/35 bg-slate-500/12 text-slate-300",
    line: "#94A3B8",
  };
}

function TrendIcon({ trend }: { trend: MarketPulseItem["trend"] }) {
  if (trend === "up") {
    return <ArrowUpRight className="h-4 w-4" />;
  }

  if (trend === "down") {
    return <ArrowDownRight className="h-4 w-4" />;
  }

  return <Minus className="h-4 w-4" />;
}

export function MarketPulse({ items }: MarketPulseProps) {
  const primaryItems = items.slice(0, 4);

  return (
    <section className="container-main py-16">
      <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Market Pulse
            </p>
            <h2 className="mt-2 text-2xl font-medium text-slate-100 md:text-3xl">
              Macro Signals at a Glance
            </h2>
          </div>
          <div className="hidden rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 md:flex md:items-center md:gap-2">
            <ShieldAlert className="h-4 w-4" />
            Live + fallback monitored feeds
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {primaryItems.map((item) => {
            const tone = getToneClasses(item.tone);

            return (
            <article key={item.label} className="rounded-xl border border-white/10 bg-[#1A1D26] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-medium text-slate-100">{item.value}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em]",
                    tone.badge
                  )}
                >
                  <TrendIcon trend={item.trend} />
                  {item.trend === "stable" ? "Stable" : item.trend === "up" ? "Rising" : "Falling"}
                </span>
              </div>

              <svg className="mt-5 h-9 w-full" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
                <polyline
                  fill="none"
                  stroke={tone.line}
                  strokeWidth="2"
                  points={getSparklinePoints(item.trend)}
                  strokeLinecap="round"
                />
              </svg>

              <p className="mt-4 text-sm leading-6 text-slate-300">{item.detail}</p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                {item.sourceLabel}
              </p>
            </article>
          )})}
        </div>
      </div>
    </section>
  );
}
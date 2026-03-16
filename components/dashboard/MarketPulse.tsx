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
  return (
    <section className="container-main -mt-8 relative z-10 pb-8">
      <div className="rounded-2xl border border-brand-200/70 bg-white/95 p-5 shadow-xl shadow-brand-950/10 backdrop-blur md:p-6">
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Market Pulse
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              The fastest read on today&apos;s macro setup
            </h2>
          </div>
          <div className="hidden rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 md:flex md:items-center md:gap-2">
            <ShieldAlert className="h-4 w-4" />
            Auto-updated from live and estimated feeds
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    item.tone === "positive"
                      ? "bg-green-100 text-green-700"
                      : item.tone === "negative"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-700"
                  )}
                >
                  <TrendIcon trend={item.trend} />
                  {item.trend === "stable" ? "Stable" : item.trend === "up" ? "Rising" : "Falling"}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{item.detail}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                {item.sourceLabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
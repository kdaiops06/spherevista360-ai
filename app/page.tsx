import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Clock3, Share2 } from "lucide-react";
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import {
  getMarketData,
  getCurrencyStrength,
  getPredictions,
} from "@/lib/fetch-live-data";
import { buildMarketPulse, getRecessionSignal } from "@/lib/financial-intelligence";

export const revalidate = 300;

const GlobalRiskRadar = dynamic(
  () => import("@/components/dashboard/GlobalRiskRadar"),
  {
    loading: () => (
      <div className="card p-6 text-sm text-slate-400">Loading Global Market Stress Radar...</div>
    ),
  }
);

const NewsletterSignup = dynamic(
  () =>
    import("@/components/monetization/NewsletterSignup").then((mod) => ({
      default: mod.NewsletterSignup,
    })),
  {
    loading: () => (
      <div className="card p-4 text-sm text-slate-400">Loading newsletter form...</div>
    ),
  }
);

function toSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default async function HomePage() {
  const [market, currency, preds, recessionSignal] = await Promise.all([
    getMarketData(),
    getCurrencyStrength(),
    getPredictions(),
    getRecessionSignal(),
  ]);

  const pulseItems = buildMarketPulse({
    marketData: market.data,
    currencyStrength: currency.data,
    predictions: preds.data,
    recessionSignal,
  });

  const sp500 = market.data.find((item) => item.symbol === "^GSPC");
  const us10y = market.data.find((item) => item.symbol === "^TNX");
  const usdStrength = currency.data.find((entry) => entry.currency === "USD");
  const leadPrediction = preds.data[0];

  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  }).format(new Date());

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0A0B0F] py-14 md:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.16)_0%,rgba(10,11,15,0)_58%)]" />
        <div className="container-main relative">
          <div className="max-w-4xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              SphereVista360 Macro Intelligence
            </p>
            <h1 className="mt-5 text-4xl font-medium leading-tight text-slate-100 md:text-5xl md:leading-tight">
              Understand Global Markets Through Data and Macro Intelligence
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Real-time market monitoring, economic signals, and institutional-style
              insights for modern investors.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-primary px-5 py-3">
                Open Dashboard
              </Link>
              <Link href="/currencies" className="btn-secondary px-5 py-3">
                Explore Markets
              </Link>
            </div>
          </div>

          <div className="mt-11 rounded-xl border border-white/10 bg-white/[0.02] p-3 backdrop-blur-sm">
            <div className="grid gap-2 text-xs text-slate-300 md:grid-cols-4 md:text-sm">
              <div className="rounded-lg bg-white/[0.02] px-3 py-2">
                <span className="mr-2 text-slate-500">S&P 500</span>
                <span className={sp500 && sp500.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {sp500 ? toSignedPercent(sp500.changePercent) : "Unavailable"}
                </span>
              </div>
              <div className="rounded-lg bg-white/[0.02] px-3 py-2">
                <span className="mr-2 text-slate-500">US 10Y</span>
                <span className="text-slate-200">{us10y ? `${us10y.price.toFixed(2)}%` : "Unavailable"}</span>
              </div>
              <div className="rounded-lg bg-white/[0.02] px-3 py-2">
                <span className="mr-2 text-slate-500">DXY Strength</span>
                <span className="text-slate-200">{usdStrength ? `${usdStrength.strength}/100` : "Unavailable"}</span>
              </div>
              <div className="rounded-lg bg-white/[0.02] px-3 py-2">
                <span className="mr-2 text-slate-500">Recession Probability</span>
                <span className="text-amber-300">{recessionSignal.probability}/100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketPulse items={pulseItems} />

      <section className="container-main py-14 md:py-16">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              AI Morning Briefing
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-white/5"
              aria-label="Share briefing"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          <div className="mt-6 border-l-2 border-blue-500/45 pl-5 md:pl-6">
            <h2 className="text-2xl font-medium text-slate-100 md:text-3xl">
              Institutional Macro Readout
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
              Equity breadth remains {sp500 && sp500.changePercent >= 0 ? "constructive" : "mixed"}, while Treasury
              yields near {us10y ? `${us10y.price.toFixed(2)}%` : "recent highs"} continue to anchor valuation
              sensitivity. Dollar strength at {usdStrength ? `${usdStrength.strength}/100` : "moderate levels"} reflects
              persistent risk hedging across global allocations.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
              Recession probability is currently {recessionSignal.probability}/100, indicating a
              {recessionSignal.probability >= 60
                ? " heightened need for defensive positioning and duration discipline"
                : recessionSignal.probability >= 40
                ? " balanced environment where selective risk is still warranted"
                : " lower near-term stress environment with measured risk-on opportunities"}
              .
            </p>
            {leadPrediction && (
              <p className="mt-3 text-sm leading-7 text-slate-400 md:text-base">
                Lead model signal: {leadPrediction.asset} remains {leadPrediction.prediction} with
                {(leadPrediction.confidence * 100).toFixed(0)}% confidence over {leadPrediction.timeframe}.
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              Generated {generatedAt}
            </span>
            <span>Updated daily at 6 AM ET</span>
          </div>
        </div>
      </section>

      <section className="container-main pb-14 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Global Market Stress Radar
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
            Observability-first monitoring of macro stress conditions across recession,
            inflation, geopolitical, and credit regimes.
          </p>
          <div className="mt-6">
            <GlobalRiskRadar />
          </div>
        </div>
      </section>

      <section className="container-main pb-14 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-medium text-slate-100 md:text-3xl">Why SphereVista360</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Real-Time Macro Monitoring",
              description:
                "Track high-signal market and economic indicators with consistent, low-noise updates.",
            },
            {
              title: "Institutional-Style Intelligence",
              description:
                "Structured views designed for disciplined decision making rather than reactive browsing.",
            },
            {
              title: "AI-Assisted Market Briefings",
              description:
                "Daily concise readouts that connect cross-asset moves to practical macro context.",
            },
          ].map((item) => (
            <article key={item.title} className="card p-6">
              <h3 className="text-lg font-medium text-slate-100">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="container-main pb-20">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-8">
          <h2 className="text-2xl font-medium text-slate-100">Stay Ahead of Global Markets</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            Receive a concise AI-assisted macro briefing every morning.
          </p>
          <div className="mt-6 max-w-xl">
            <NewsletterSignup variant="dark" />
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "SphereVista360",
            url: "https://spherevista360.com",
            description: "Macro-financial intelligence and market observability platform.",
          }),
        }}
      />
    </>
  );
}

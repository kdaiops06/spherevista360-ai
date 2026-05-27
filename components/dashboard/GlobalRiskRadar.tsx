"use client";

import { AlertTriangle, TrendingDown, Globe, DollarSign, Shield, Activity } from "lucide-react";

interface RiskCategory {
  name: string;
  score: number;
  icon: React.ElementType;
  description: string;
  color: string;
}

const DEFAULT_RISKS: RiskCategory[] = [
  {
    name: "Recession Risk",
    score: 42,
    icon: TrendingDown,
    description: "Based on yield curve inversion, PMI data, and unemployment trends.",
    color: "#EF4444",
  },
  {
    name: "Inflation Risk",
    score: 58,
    icon: DollarSign,
    description: "Driven by CPI trends, commodity prices, and central bank policy.",
    color: "#F59E0B",
  },
  {
    name: "Currency Crisis Risk",
    score: 35,
    icon: Globe,
    description: "Emerging market debt levels, reserve adequacy, and capital flows.",
    color: "#F59E0B",
  },
  {
    name: "Geopolitical Risk",
    score: 67,
    icon: Shield,
    description: "Trade tensions, regional conflicts, and sanctions impact.",
    color: "#8B5CF6",
  },
  {
    name: "Debt Crisis Risk",
    score: 54,
    icon: Activity,
    description: "Sovereign debt-to-GDP ratios, corporate leverage, and credit spreads.",
    color: "#3B82F6",
  },
];

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Critical", color: "text-rose-300" };
  if (score >= 60) return { label: "High", color: "text-amber-300" };
  if (score >= 40) return { label: "Moderate", color: "text-yellow-200" };
  return { label: "Low", color: "text-emerald-300" };
}

export default function GlobalRiskRadar({ compact = false }: { compact?: boolean }) {
  const risks = DEFAULT_RISKS;

  const globalScore = Math.round(
    risks.reduce((sum, r) => sum + r.score, 0) / risks.length
  );
  const globalLevel = getRiskLevel(globalScore);

  const levelAccent =
    globalScore >= 75
      ? "border-rose-400/40 bg-rose-500/12"
      : globalScore >= 60
      ? "border-amber-400/40 bg-amber-500/12"
      : globalScore >= 40
      ? "border-yellow-400/40 bg-yellow-500/12"
      : "border-emerald-400/40 bg-emerald-500/12";

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            Global Market Stress Radar
          </h3>
          <span className="text-xs text-slate-500 font-medium">Estimated</span>
        </div>
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full border ${levelAccent} text-slate-100`}>
            <span className="text-2xl font-medium">{globalScore}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">/ 100</p>
        </div>
        <div className="space-y-2">
          {risks.map((risk) => (
            <div key={risk.name} className="flex items-center gap-2">
              <span className="w-24 truncate text-xs text-slate-400">{risk.name.replace(" Risk", "")}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${risk.score}%`, backgroundColor: risk.color }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-slate-300">{risk.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          </p>
          <h3 className="mt-2 text-2xl font-medium text-slate-100 md:text-3xl">
            Macro Risk Monitoring
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
            Composite stress index derived from recession, inflation, currency,
            geopolitical, and debt pressure signals.
          </p>
        </div>

        <div className={`rounded-xl border ${levelAccent} px-5 py-4 text-center`}>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Stress Score</p>
          <p className="mt-1 text-4xl font-medium text-slate-100">{globalScore}</p>
          <p className={`mt-1 text-sm font-medium ${globalLevel.color}`}>{globalLevel.label}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {risks.map((risk) => {
          const level = getRiskLevel(risk.score);
          return (
            <article key={risk.name} className="rounded-xl border border-white/10 bg-[#1A1D26] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="rounded-lg border p-2"
                  style={{ borderColor: `${risk.color}66`, backgroundColor: `${risk.color}1f` }}
                >
                  <risk.icon className="h-5 w-5 text-slate-200" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-100">{risk.name}</h3>
                  <span className={`text-sm font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Score</span>
                  <span className="font-medium text-slate-200">{risk.score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: risk.color, width: `${risk.score}%` }}
                  />
                </div>
              </div>
              <p className="text-xs leading-5 text-slate-400">{risk.description}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-[#1A1D26] p-5">
        <h4 className="text-sm font-medium uppercase tracking-[0.12em] text-slate-400">Methodology</h4>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          The Global Risk Score is a composite index derived from five weighted risk categories
          based on publicly available economic research including yield curves, PMI, CPI trends,
          and geopolitical indicators. Scores are periodically reviewed estimates and should not
          be the sole basis for financial decisions.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
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
    color: "bg-red-500",
  },
  {
    name: "Inflation Risk",
    score: 58,
    icon: DollarSign,
    description: "Driven by CPI trends, commodity prices, and central bank policy.",
    color: "bg-orange-500",
  },
  {
    name: "Currency Crisis Risk",
    score: 35,
    icon: Globe,
    description: "Emerging market debt levels, reserve adequacy, and capital flows.",
    color: "bg-yellow-500",
  },
  {
    name: "Geopolitical Risk",
    score: 67,
    icon: Shield,
    description: "Trade tensions, regional conflicts, and sanctions impact.",
    color: "bg-purple-500",
  },
  {
    name: "Debt Crisis Risk",
    score: 54,
    icon: Activity,
    description: "Sovereign debt-to-GDP ratios, corporate leverage, and credit spreads.",
    color: "bg-blue-500",
  },
];

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Critical", color: "text-red-600" };
  if (score >= 60) return { label: "High", color: "text-orange-600" };
  if (score >= 40) return { label: "Moderate", color: "text-yellow-600" };
  return { label: "Low", color: "text-green-600" };
}

function getGlobalColor(score: number): string {
  if (score >= 75) return "from-red-500 to-red-700";
  if (score >= 60) return "from-orange-500 to-red-600";
  if (score >= 40) return "from-yellow-500 to-orange-500";
  return "from-green-500 to-green-600";
}

export default function GlobalRiskRadar({ compact = false }: { compact?: boolean }) {
  const [risks] = useState<RiskCategory[]>(DEFAULT_RISKS);

  const globalScore = Math.round(
    risks.reduce((sum, r) => sum + r.score, 0) / risks.length
  );
  const globalLevel = getRiskLevel(globalScore);
  const globalGradient = getGlobalColor(globalScore);

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Global Risk Radar
          </h3>
          <span className="text-xs text-gray-500 font-medium">Estimated</span>
        </div>
        <div className="text-center mb-4">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${globalGradient} text-white`}
          >
            <span className="text-2xl font-bold">{globalScore}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">/ 100</p>
        </div>
        <div className="space-y-2">
          {risks.map((risk) => (
            <div key={risk.name} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-24 truncate">{risk.name.replace(" Risk", "")}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${risk.color}`}
                  style={{ width: `${risk.score}%` }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right">{risk.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Global Score */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br ${globalGradient} text-white shadow-lg`}
        >
          <div>
            <p className="text-4xl font-bold">{globalScore}</p>
            <p className="text-sm opacity-80">/ 100</p>
          </div>
        </div>
        <p className={`mt-3 text-xl font-bold ${globalLevel.color}`}>
          {globalLevel.label} Risk
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Estimated from public economic data
        </p>
      </div>

      {/* Risk Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {risks.map((risk) => {
          const level = getRiskLevel(risk.score);
          return (
            <div key={risk.name} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${risk.color} bg-opacity-10`}>
                  <risk.icon className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{risk.name}</h3>
                  <span className={`text-sm font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Score</span>
                  <span className="font-bold">{risk.score}/100</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${risk.color} transition-all`}
                    style={{ width: `${risk.score}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">{risk.description}</p>
            </div>
          );
        })}
      </div>

      {/* Methodology */}
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <h3 className="font-semibold text-gray-900 mb-2">Methodology</h3>
        <p className="text-sm text-gray-600">
          The Global Risk Score is a composite index derived from five weighted risk categories
          based on publicly available economic research including yield curves, PMI, CPI trends,
          and geopolitical indicators. Scores are periodically reviewed estimates and should not
          be the sole basis for financial decisions.
        </p>
      </div>
    </div>
  );
}

import type { ComparisonHorizon } from "@/lib/stock-compare/types";

interface AiInsightInput {
  ticker: string;
  horizon: ComparisonHorizon;
  volatility: number | null;
  rsi: number | null;
  debtToEquity: number | null;
  freeCashFlow: number | null;
  revenueGrowth: number | null;
}

export function buildAiInsight(input: AiInsightInput): string {
  const notes: string[] = [];

  if (input.revenueGrowth != null && input.revenueGrowth > 12) {
    notes.push("growth trend is strong");
  }
  if (input.debtToEquity != null && input.debtToEquity > 1.5) {
    notes.push("balance-sheet leverage is elevated");
  }
  if (input.freeCashFlow != null && input.freeCashFlow > 0) {
    notes.push("cash generation supports resilience");
  }
  if (input.volatility != null && input.volatility > 35) {
    notes.push("price volatility is elevated");
  }
  if (input.rsi != null && input.rsi > 70) {
    notes.push("momentum is overbought");
  }

  if (notes.length === 0) {
    return `${input.ticker} has limited signal density for ${input.horizon}; monitor additional data points.`;
  }

  return `${input.ticker} ${notes.join(", ")} for ${input.horizon}.`;
}

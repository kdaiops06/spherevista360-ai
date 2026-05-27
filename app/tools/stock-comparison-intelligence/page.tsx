import type { Metadata } from "next";
import { StockComparisonIntelligence } from "@/components/tools/StockComparisonIntelligence";
import { getStockComparisonSnapshot } from "@/lib/stock-compare/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Stock Comparison Intelligence Engine",
  description:
    "Institutional-grade AI stock comparison for 2-6 equities with horizon-based investment scoring, risk/reward analysis, valuation intelligence, and side-by-side visual analytics.",
};

export default async function StockComparisonIntelligencePage() {
  const snapshot = await getStockComparisonSnapshot({
    symbols: ["NVDA", "AMD", "INTC"],
    horizon: "1Y",
  });

  return <StockComparisonIntelligence initialSnapshot={snapshot} />;
}

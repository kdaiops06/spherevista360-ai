import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export type PortfolioSuggestion = {
  type: "risk" | "diversification" | "optimization";
  title: string;
  reason: string;
  action: string;
  confidence: "Low" | "Medium" | "High";
};

export function generatePortfolioSuggestions(
  assets: Asset[],
  opts?: { premium?: boolean; riskLevel?: "Low" | "Medium" | "High" }
): PortfolioSuggestion[] {
  const suggestions: PortfolioSuggestion[] = [];
  const allocation = calculateAllocation(assets);
  if (assets.length === 0) return suggestions;

  const sorted = [...allocation].sort((a, b) => b.percentage - a.percentage);
  const maxAlloc = sorted[0]?.percentage || 0;
  const maxAsset = sorted[0]?.ticker || "";
  const top2Sum = (sorted[0]?.percentage || 0) + (sorted[1]?.percentage || 0);
  const topAsset1 = sorted[0]?.ticker || "";
  const topAsset2 = sorted[1]?.ticker || "";
  const numberOfAssets = assets.length;
  const riskLevel = opts?.riskLevel;

  // 1. Concentration Rule
  if (maxAlloc > 40) {
    suggestions.push({
      type: "risk",
      title: "⚠️ Concentration Risk Detected",
      reason:
        `Your portfolio is heavily concentrated in ${maxAsset} (${maxAlloc.toFixed(1)}%), increasing exposure to its price swings.`,
      action:
        `Reduce allocation of ${maxAsset} below 30% to improve balance and lower risk.`,
      confidence: maxAlloc > 50 ? "High" : "Medium",
    });
  }

  // 2. Top Holdings Rule
  if (sorted.length > 1 && top2Sum > 70) {
    suggestions.push({
      type: "diversification",
      title: "⚠️ Low Diversification",
      reason:
        `Most of your portfolio is tied to ${topAsset1} and ${topAsset2} (${top2Sum.toFixed(1)}%), which reduces diversification benefits.`,
      action:
        `Spread capital across more sectors or add uncorrelated assets to reduce concentration risk.`,
      confidence: top2Sum > 70 ? "High" : "Medium",
    });
  }

  // 3. Diversification Rule
  if (numberOfAssets < 3) {
    suggestions.push({
      type: "diversification",
      title: "⚠️ Not Enough Assets",
      reason:
        `Limited number of assets (${numberOfAssets}) increases overall portfolio risk and reduces stability.`,
      action:
        `Add 1–2 uncorrelated assets such as ETFs or bonds to improve diversification.`,
      confidence: "Medium",
    });
  }

  // 4. Generic Diversification Suggestion (if not already present)
  if (suggestions.length < 2) {
    suggestions.push({
      type: "diversification",
      title: "💡 Diversification Opportunity",
      reason:
        `Adding more asset classes can help reduce volatility and improve long-term returns.`,
      action:
        `Consider adding ETFs or bonds to diversify beyond your current holdings.`,
      confidence: "Low",
    });
  }

  // 5. Defensive Strategy Suggestion (ensure actionable)
  if ((riskLevel === "High" || maxAlloc > 50) && suggestions.length < 3) {
    suggestions.push({
      type: "optimization",
      title: "🛡️ Defensive Strategy",
      reason:
        `High risk detected due to concentration or market conditions.`,
      action:
        `Consider a defensive strategy to protect against downside risk (e.g., increase cash or bonds).`,
      confidence: "High",
    });
  }

  // Remove duplicates by title and limit output
  const unique: PortfolioSuggestion[] = [];
  const seen = new Set();
  for (const s of suggestions) {
    if (!seen.has(s.title)) {
      unique.push(s);
      seen.add(s.title);
    }
  }
  // Premium suggestion
  if (opts?.premium && unique.length < 3) {
    unique.push({
      type: "optimization",
      title: "✨ Premium Insight",
      reason: `AI-powered optimization can further improve your portfolio's risk/return profile.`,
      action: `Unlock premium to get a personalized allocation plan based on your current portfolio.`,
      confidence: "Medium",
    });
  }
  // Limit to 2–3 insights, prioritize by confidence
  return unique
    .sort((a, b) => (b.confidence === "High" ? 1 : 0) - (a.confidence === "High" ? 1 : 0))
    .slice(0, 3);
}

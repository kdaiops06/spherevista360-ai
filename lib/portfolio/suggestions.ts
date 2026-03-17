import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export function generatePortfolioSuggestions(assets: Asset[], opts?: { premium?: boolean, riskLevel?: 'Low' | 'Medium' | 'High' }): string[] {
  const suggestions: string[] = [];
  const allocation = calculateAllocation(assets);
  if (assets.length === 0) return suggestions;

  const sorted = [...allocation].sort((a, b) => b.percentage - a.percentage);
  const maxAlloc = sorted[0]?.percentage || 0;
  const maxAsset = sorted[0]?.ticker || '';
  const top2Sum = (sorted[0]?.percentage || 0) + (sorted[1]?.percentage || 0);
  const topAsset1 = sorted[0]?.ticker || '';
  const topAsset2 = sorted[1]?.ticker || '';
  const numberOfAssets = assets.length;
  const riskLevel = opts?.riskLevel;

  // 1. Concentration Rule
  if (maxAlloc > 50) {
    suggestions.push(`Your largest holding (${maxAsset}) is ${maxAlloc.toFixed(1)}% of your portfolio — reducing it can improve balance and lower risk.`);
  }

  // 2. Top Holdings Rule (improved)
  if (sorted.length > 1 && top2Sum > 70) {
    suggestions.push(`${topAsset1} and ${topAsset2} together make up ${top2Sum.toFixed(1)}% of your portfolio — reducing them can improve balance.`);
  }

  // 3. Diversification Rule
  if (numberOfAssets < 3) {
    suggestions.push(`Your portfolio includes only ${numberOfAssets} asset${numberOfAssets === 1 ? '' : 's'}. Consider diversifying across additional assets to reduce concentration risk.`);
  }

  // 4. Generic Diversification Suggestion (improved)
  if (suggestions.length < 3) {
    suggestions.push('Add ETFs or bonds to diversify beyond your current holdings and reduce volatility.');
  }

  // 5. Defensive Strategy Suggestion (ensure actionable)
  if ((riskLevel === 'High' || maxAlloc > 50) && suggestions.length < 3) {
    suggestions.push('Consider a defensive strategy to protect against downside risk.');
  }

  // Remove duplicates and limit output
  let unique = Array.from(new Set(suggestions));
  // Ensure minimum suggestions for assets.length >= 2
  if (assets.length >= 2 && unique.length < 2) {
    unique.push('Consider diversifying across additional assets to reduce concentration risk.');
  }
  // Ensure at least one actionable suggestion
  if (!unique.some(s => s.toLowerCase().includes('diversify') || s.toLowerCase().includes('defensive'))) {
    unique.push('Add ETFs or bonds to diversify beyond your current holdings and reduce volatility.');
  }
  // Premium suggestion
  if (opts?.premium && unique.length < 3) {
    unique.push('Optimized allocation plan based on your current portfolio.');
  }
  return unique.slice(0, 3);
}

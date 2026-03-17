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
  const numberOfAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + a.amount, 0);
  const riskLevel = opts?.riskLevel;
  // 1. Concentration Rule
  if (maxAlloc > 50) {
    suggestions.push(`Your largest holding (${maxAsset}) makes up ${maxAlloc.toFixed(1)}% of your portfolio. Reducing it can improve balance and reduce risk.`);
  }
  // 2. Low Diversification Rule
  if (numberOfAssets < 3) {
    suggestions.push(`Your portfolio includes only ${numberOfAssets} asset${numberOfAssets === 1 ? '' : 's'}. Adding more assets can improve diversification and reduce volatility.`);
  }
  // 3. Top-Heavy Portfolio Rule
  if (sorted.length > 1 && top2Sum > 70) {
    suggestions.push('Your top holdings dominate your portfolio, increasing exposure to a limited set of assets.');
  }
  // 4. Defensive Strategy Suggestion
  if ((riskLevel === 'High' || maxAlloc > 50) && suggestions.length < 3) {
    suggestions.push('Consider adding ETFs, bonds, or commodities to reduce downside risk.');
  }
  // Remove duplicates and limit to 3-4 suggestions
  const unique = Array.from(new Set(suggestions));
  if (opts?.premium && unique.length < 4) {
    unique.push('Optimized allocation plan based on your current portfolio.');
  }
  return unique.slice(0, 4);
}

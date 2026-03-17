import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export function generatePortfolioSuggestions(assets: Asset[]): string[] {
  const suggestions: string[] = [];
  const allocation = calculateAllocation(assets);
  if (assets.length === 0) return suggestions;

  const sorted = [...allocation].sort((a, b) => b.percentage - a.percentage);
  const maxAlloc = sorted[0]?.percentage || 0;
  const maxAsset = sorted[0]?.ticker || '';
  const top2Sum = (sorted[0]?.percentage || 0) + (sorted[1]?.percentage || 0);

  // Max allocation > 50%
  if (maxAlloc > 50) {
    suggestions.push(`Your largest holding (${maxAsset}) is ${maxAlloc.toFixed(1)}%. Reducing it can improve balance.`);
  }

  // Top 2 assets > 70%
  if (sorted.length > 1 && top2Sum > 70) {
    suggestions.push('Your top holdings dominate your portfolio, increasing concentration risk.');
  }

  // Number of assets < 3
  if (assets.length < 3) {
    suggestions.push('Your portfolio has limited diversification. Consider adding more asset classes.');
    suggestions.push('Explore ETFs, bonds, or commodities for broader exposure.');
  }

  // Optional: Suggest hedge if no gold
  if (!assets.some(a => a.ticker === 'GOLD')) {
    suggestions.push('Add hedge assets like gold to protect against market downturns.');
  }

  // Optional: Crypto-specific
  if (allocation.some(a => (a.ticker === 'BTC' || a.ticker === 'ETH') && a.percentage > 30)) {
    suggestions.push('Reduce crypto exposure (BTC/ETH) to lower volatility.');
  }

  return suggestions;
}

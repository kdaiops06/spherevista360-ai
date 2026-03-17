import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export function generatePortfolioSuggestions(assets: Asset[]): string[] {
  const suggestions: string[] = [];
  const allocation = calculateAllocation(assets);

  // Rule 1: Crypto exposure
  if (allocation.some(a => (a.ticker === 'BTC' || a.ticker === 'ETH') && a.percentage > 30)) {
    suggestions.push('Consider reducing crypto exposure to lower volatility');
  }

  // Rule 2: Concentration
  if (allocation.some(a => a.percentage > 50)) {
    suggestions.push('Your portfolio is concentrated. Consider diversification');
  }

  // Rule 3: No gold
  if (!assets.some(a => a.ticker === 'GOLD')) {
    suggestions.push('Consider adding hedge assets like gold');
  }

  // Rule 4: Not enough assets
  if (assets.length < 2) {
    suggestions.push('Add more assets to diversify your portfolio');
  }

  return suggestions;
}

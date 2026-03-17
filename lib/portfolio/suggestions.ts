import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export function generatePortfolioSuggestions(assets: Asset[]): string[] {
  const suggestions: string[] = [];
  const allocation = calculateAllocation(assets);

  if (assets.length === 0) return suggestions;

  // Diversification advice
  if (assets.length < 3) {
    suggestions.push('Add more assets to diversify your portfolio and reduce risk.');
  }

  // Concentration warnings
  const sorted = [...allocation].sort((a, b) => b.percentage - a.percentage);
  if (sorted.length > 0 && sorted[0].percentage > 40) {
    suggestions.push(`Your largest holding is ${sorted[0].ticker} at ${sorted[0].percentage.toFixed(1)}%. Consider reducing concentration.`);
  }
  if (sorted.length > 1 && (sorted[0].percentage + sorted[1].percentage) > 70) {
    suggestions.push(`Top 2 assets (${sorted[0].ticker}, ${sorted[1].ticker}) make up over 70% of your portfolio. Diversify further for stability.`);
  }

  // Asset balancing tips
  allocation.forEach(a => {
    if (a.percentage < 10) {
      suggestions.push(`Consider increasing your allocation to ${a.ticker} for better balance.`);
    }
    if (a.percentage > 60) {
      suggestions.push(`Reduce your allocation to ${a.ticker} to avoid overexposure.`);
    }
  });

  // Crypto-specific
  if (allocation.some(a => (a.ticker === 'BTC' || a.ticker === 'ETH') && a.percentage > 30)) {
    suggestions.push('Reduce crypto exposure (BTC/ETH) to lower volatility.');
  }

  // Hedge asset advice
  if (!assets.some(a => a.ticker === 'GOLD')) {
    suggestions.push('Add hedge assets like gold to protect against market downturns.');
  }

  return suggestions;
}

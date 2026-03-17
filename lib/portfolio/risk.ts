import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export interface PortfolioRisk {
  score: number;
  level: 'Low' | 'Medium' | 'High';
}

export function calculatePortfolioRisk(assets: Asset[]): PortfolioRisk {
  const allocation = calculateAllocation(assets);

  // High Risk: Any crypto (BTC, ETH) > 30%
  if (allocation.some(a => (a.ticker === 'BTC' || a.ticker === 'ETH') && a.percentage > 30)) {
    return { score: 80, level: 'High' };
  }

  // Medium Risk: Any single asset > 50%
  if (allocation.some(a => a.percentage > 50)) {
    return { score: 60, level: 'Medium' };
  }

  // Low Risk: Otherwise
  return { score: 30, level: 'Low' };
}

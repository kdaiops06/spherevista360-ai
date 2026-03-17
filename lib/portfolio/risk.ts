import { Asset } from './calculations';
import { calculateAllocation } from './calculations';

export interface PortfolioRisk {
  score: number;
  level: 'Low' | 'Medium' | 'High';
}

export function calculatePortfolioRisk(assets: Asset[]): PortfolioRisk {
  const allocation = calculateAllocation(assets);
  if (assets.length === 1) {
    return { score: 80, level: 'High' };
  }
  if (allocation.length > 0) {
    const maxAlloc = Math.max(...allocation.map(a => a.percentage));
    if (maxAlloc > 60) {
      return { score: 70, level: 'High' };
    }
    if (maxAlloc > 40) {
      return { score: 50, level: 'Medium' };
    }
  }
  return { score: 30, level: 'Low' };
}

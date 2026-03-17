export interface Asset {
  ticker: string;
  amount: number;
}

export interface AssetAllocation extends Asset {
  percentage: number;
}

export function calculateTotalValue(assets: Asset[]): number {
  if (!Array.isArray(assets)) return 0;
  return assets.reduce((sum, asset) => sum + (typeof asset.amount === 'number' ? asset.amount : 0), 0);
}

export function calculateAllocation(assets: Asset[]): AssetAllocation[] {
  if (!Array.isArray(assets) || assets.length === 0) return [];
  const total = calculateTotalValue(assets);
  if (total === 0) return [];
  return assets.map(asset => ({
    ...asset,
    percentage: (asset.amount / total) * 100,
  }));
}

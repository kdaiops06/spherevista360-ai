import React from 'react';
import { calculateTotalValue, calculateAllocation, Asset } from '../../lib/portfolio/calculations';

interface PortfolioSummaryProps {
  assets: Asset[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ assets }) => {
  const total = calculateTotalValue(assets);
  const allocation = calculateAllocation(assets);

  // Overexposure detection
  let overexposureWarning = null;
  if (allocation.length > 0) {
    // Find asset with >40% allocation
    const overAsset = allocation.find(a => a.percentage > 40);
    // Sort by percentage descending
    const sorted = [...allocation].sort((a, b) => b.percentage - a.percentage);
    const top2 = sorted.slice(0, 2);
    const top2Sum = top2.reduce((sum, a) => sum + a.percentage, 0);
    if (overAsset) {
      overexposureWarning = (
        <div style={{ color: 'orange', fontWeight: 'bold', marginBottom: 8 }}>
          You are heavily concentrated in {overAsset.ticker}. Consider reducing exposure.
        </div>
      );
    }
    if (top2.length === 2 && top2Sum > 70) {
      overexposureWarning = (
        <div style={{ color: 'orange', fontWeight: 'bold', marginBottom: 8 }}>
          Your portfolio lacks diversification across assets.
        </div>
      );
    }
  }
  // Market crash simulation
  const crashLoss = total * 0.2;
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3>Portfolio Summary</h3>
      <div style={{ marginBottom: 12 }}>
        <strong>Total Value:</strong> ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {overexposureWarning}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allocation.map(asset => (
          <li key={asset.ticker} style={{ marginBottom: 6 }}>
            {asset.ticker} &rarr; {asset.percentage.toFixed(2)}%
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16, color: '#b00', fontWeight: 'bold' }}>
        If market drops 20%, your portfolio may lose ${crashLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default PortfolioSummary;

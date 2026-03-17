import React from 'react';
import { calculateTotalValue, calculateAllocation, Asset } from '../../lib/portfolio/calculations';

interface PortfolioSummaryProps {
  assets: Asset[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ assets }) => {
  const total = calculateTotalValue(assets);
  const allocation = calculateAllocation(assets);

  // Market crash simulation
  const crashLoss = total * 0.2;
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3>Portfolio Summary</h3>
      <div style={{ marginBottom: 12 }}>
        <strong>Total Value:</strong> ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allocation.map(asset => (
          <li key={asset.ticker} style={{ marginBottom: 6 }}>
            {asset.ticker} &rarr; {asset.percentage.toFixed(2)}%
          </li>
        ))}
      </ul>
      <div style={{ margin: '32px 0 0 0', padding: 16, background: '#f6f6fa', border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <div style={{ fontWeight: 'bold', color: '#b00', marginBottom: 6, fontSize: 18 }}>
          📉 Market Downside Scenario
        </div>
        <div style={{ fontSize: 16, color: '#222' }}>
          If market drops 20%, your portfolio may lose <span style={{ fontWeight: 'bold', color: '#b00' }}>${crashLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
          Market volatility can significantly impact concentrated portfolios.
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;

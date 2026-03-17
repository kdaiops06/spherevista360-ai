import React from 'react';
import { calculateTotalValue, calculateAllocation, Asset } from '../../lib/portfolio/calculations';

interface PortfolioSummaryProps {
  assets: Asset[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ assets }) => {
  const total = calculateTotalValue(assets);
  const allocation = calculateAllocation(assets);

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
    </div>
  );
};

export default PortfolioSummary;

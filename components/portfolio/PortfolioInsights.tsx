import React from 'react';
import { Asset, calculateAllocation } from '../../lib/portfolio/calculations';

interface PortfolioInsightsProps {
  assets: Asset[];
}

const PortfolioInsights: React.FC<PortfolioInsightsProps> = ({ assets }) => {
  const allocation = calculateAllocation(assets);
  if (allocation.length === 0) return null;

  // Top 2 asset concentration
  const sorted = [...allocation].sort((a, b) => b.percentage - a.percentage);
  const top2 = sorted.slice(0, 2);
  const top2Sum = top2.reduce((sum, a) => sum + a.percentage, 0);

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16, border: '1px solid #eee', borderRadius: 8, marginTop: 16 }}>
      <h3>Portfolio Insights</h3>
      <div style={{ marginBottom: 8 }}>
        <strong>Top 2 Asset Concentration:</strong> {top2.map(a => `${a.ticker} (${a.percentage.toFixed(2)}%)`).join(', ')}
      </div>
      {top2.length === 2 && top2Sum > 70 && (
        <div style={{ color: 'orange', fontWeight: 'bold' }}>
          Diversification warning: Your top 2 assets make up more than 70% of your portfolio.
        </div>
      )}
    </div>
  );
};

export default PortfolioInsights;

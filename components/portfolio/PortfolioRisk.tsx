import React from 'react';

interface PortfolioRiskProps {
  risk: {
    score: number;
    level: 'Low' | 'Medium' | 'High';
  };
}

const levelColor = {
  Low: 'green',
  Medium: 'orange',
  High: 'red',
};

const PortfolioRisk: React.FC<PortfolioRiskProps> = ({ risk }) => {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3>Portfolio Risk</h3>
      <div style={{ fontSize: 32, fontWeight: 'bold', color: levelColor[risk.level], marginBottom: 8 }}>
        {risk.score} / 100
      </div>
      <div style={{ color: levelColor[risk.level], fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
        {risk.level} Risk
      </div>
      <div style={{ color: '#555', fontSize: 15, background: '#f8f8f8', borderRadius: 6, padding: '8px 12px', marginBottom: 0 }}>
        Based on asset concentration and diversification
      </div>
    </div>
  );
};

export default PortfolioRisk;

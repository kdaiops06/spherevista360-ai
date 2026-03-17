"use client";
import React, { useState } from 'react';
import PremiumFakeDoor from '../../components/portfolio/PremiumFakeDoor';
import PortfolioInput from '../../components/portfolio/PortfolioInput';
import PortfolioSummary from '../../components/portfolio/PortfolioSummary';
import PortfolioRisk from '../../components/portfolio/PortfolioRisk';
import PortfolioSuggestions from '../../components/portfolio/PortfolioSuggestions';
import PortfolioInsights from '../../components/portfolio/PortfolioInsights';
import { calculatePortfolioRisk } from '../../lib/portfolio/risk';
import { generatePortfolioSuggestions } from '../../lib/portfolio/suggestions';
import { Asset } from '../../lib/portfolio/calculations';

const PortfolioAnalyzerPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [premium, setPremium] = useState(false);

  // Wrap setAssets to show loading state
  const handleSetAssets: React.Dispatch<React.SetStateAction<Asset[]>> = (value) => {
    setLoading(true);
    setAssets(prev => {
      const result = typeof value === 'function' ? (value as (prev: Asset[]) => Asset[])(prev) : value;
      setTimeout(() => setLoading(false), 600); // Simulate analysis delay
      return result;
    });
  };

  const risk = calculatePortfolioRisk(assets);
  const suggestions = generatePortfolioSuggestions(assets, { premium, riskLevel: risk.level });

  // Overexposure warning block logic
  let overexposureBlock = null;
  if (!loading && assets.length > 0) {
    // Calculate allocation
    const total = assets.reduce((sum, a) => sum + a.amount, 0);
    const allocation = total > 0 ? assets.map(a => ({ ...a, percentage: (a.amount / total) * 100 })) : [];
    const overAsset = allocation.find(a => a.percentage > 40);
    if (overAsset) {
      overexposureBlock = (
        <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 16, margin: '16px 0', color: '#ad6800', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>0</span>
          <span>
            You are heavily concentrated in {overAsset.ticker} ({overAsset.percentage.toFixed(1)}%).<br />
            This exposes you to significant single-stock risk.
          </span>
        </div>
      );
    }
  }
  return (
    <main style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <PortfolioInput assets={assets} setAssets={handleSetAssets} />
      {loading && assets.length > 0 && (
        <div style={{ textAlign: 'center', margin: '32px 0', fontWeight: 'bold', color: '#888' }}>
          Analyzing your portfolio...
        </div>
      )}
      {!loading && assets.length > 0 && (
        <>
          <div style={{ height: 24 }} />
          <PortfolioSummary assets={assets} />
          <div style={{ height: 24 }} />
          <PortfolioRisk risk={risk} />
          {overexposureBlock}
          <div style={{ height: 24 }} />
          <div style={{ margin: '32px 0 8px 0', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.2 }}>
            Portfolio Insights
          </div>
          <PortfolioInsights assets={assets} />
          <div style={{ height: 24 }} />
          <PortfolioSuggestions suggestions={suggestions} />
        </>
      )}
      {!loading && assets.length > 0 && <PremiumFakeDoor onUnlock={() => setPremium(true)} />}
    </main>
  );
};

export default PortfolioAnalyzerPage;

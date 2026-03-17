"use client";
import React, { useState } from 'react';
import PortfolioInput from '../../components/portfolio/PortfolioInput';
import PortfolioSummary from '../../components/portfolio/PortfolioSummary';
import PortfolioRisk from '../../components/portfolio/PortfolioRisk';
import PortfolioSuggestions from '../../components/portfolio/PortfolioSuggestions';
import { calculatePortfolioRisk } from '../../lib/portfolio/risk';
import { generatePortfolioSuggestions } from '../../lib/portfolio/suggestions';
import { Asset } from '../../lib/portfolio/calculations';

const PortfolioAnalyzerPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  const risk = calculatePortfolioRisk(assets);
  const suggestions = generatePortfolioSuggestions(assets);

  return (
    <main style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <PortfolioInput assets={assets} setAssets={setAssets} />
      {assets.length > 0 && (
        <>
          <div style={{ height: 24 }} />
          <PortfolioSummary assets={assets} />
          <div style={{ height: 24 }} />
          <PortfolioRisk risk={risk} />
          <div style={{ height: 24 }} />
          <PortfolioSuggestions suggestions={suggestions} />
        </>
      )}
      {assets.length > 0 && (
        <div
          style={{
            marginTop: 32,
            padding: 16,
            border: "1px dashed #ccc",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: 8 }}>
            🔒 Advanced optimization insights coming soon
          </p>
          <p style={{ fontSize: 14, color: "#666" }}>
            Get deeper portfolio analysis, AI forecasts, and personalized optimization strategies.
          </p>
        </div>
      )}
    </main>
  );
};

export default PortfolioAnalyzerPage;

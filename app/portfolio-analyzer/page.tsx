"use client";
import React, { useState } from 'react';
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

  // Wrap setAssets to show loading state
  const handleSetAssets = (newAssets: Asset[]) => {
    setLoading(true);
    setAssets(newAssets);
    setTimeout(() => setLoading(false), 600); // Simulate analysis delay
  };

  const risk = calculatePortfolioRisk(assets);
  const suggestions = generatePortfolioSuggestions(assets);

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
          <div style={{ height: 24 }} />
          <PortfolioInsights assets={assets} />
          <div style={{ height: 24 }} />
          <PortfolioSuggestions suggestions={suggestions} />
        </>
      )}
      {!loading && assets.length > 0 && <PremiumFakeDoor />}
    // Monetization test (fake door)
    const PremiumFakeDoor: React.FC = () => {
      const [showInput, setShowInput] = useState(false);
      const [email, setEmail] = useState('');
      const [submitted, setSubmitted] = useState(false);

      const handleUnlock = () => setShowInput(true);
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
          // Log email to console (fake door)
          // eslint-disable-next-line no-console
          console.log('Premium interest email:', email);
          setSubmitted(true);
        }
      };

      return (
        <div
          style={{
            marginTop: 32,
            padding: 16,
            border: "1px dashed #ccc",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          {!showInput && !submitted && (
            <button
              style={{
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '10px 20px',
                fontWeight: 'bold',
                fontSize: 16,
                cursor: 'pointer',
                marginBottom: 8,
              }}
              onClick={handleUnlock}
            >
              🔒 Unlock Advanced Insights ($9)
            </button>
          )}
          {showInput && !submitted && (
            <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  marginRight: 8,
                  width: 200,
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Submit
              </button>
            </form>
          )}
          {submitted && (
            <div style={{ color: 'green', fontWeight: 'bold', marginTop: 8 }}>
              Thank you! We'll notify you when advanced insights are available.
            </div>
          )}
          <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
            Get deeper portfolio analysis, AI forecasts, and personalized optimization strategies.
          </div>
        </div>
      );
    };
    </main>
  );
};

export default PortfolioAnalyzerPage;

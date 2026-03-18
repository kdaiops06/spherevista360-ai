

import React, { useState } from 'react';

interface Asset {
	ticker: string;
	amount: number;
}

interface PortfolioInputProps {
	assets: Asset[];
	setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}


const PortfolioInput: React.FC<PortfolioInputProps> = ({ assets, setAssets }) => {
  const [ticker, setTicker] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (!ticker.trim() || !amount || isNaN(Number(amount))) return;
    setAssets([...assets, { ticker: ticker.trim().toUpperCase(), amount: Number(amount) }]);
    setTicker('');
    setAmount('');
  };

  const handleRemove = (idx: number) => {
    setAssets(assets.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Enter Your Portfolio</h2>
      <div style={{ color: '#555', fontSize: 15, marginBottom: 18 }}>
        {/* Helper text (shortened) */}
        Add each asset with ticker and amount in USD
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="e.g. AAPL, BTC, TSLA"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="e.g. 1000 (USD)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: 120, padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <button
        onClick={handleAdd}
        style={{
          width: '100%',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '12px 0',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          marginBottom: 10,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        Analyze Portfolio
      </button>
      <div style={{ textAlign: 'center', color: '#888', fontSize: 15, margin: '8px 0 0 0' }}>or</div>
      <button
        type="button"
        style={{
          width: '100%',
          background: '#f3f4f6',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '10px 0',
          fontSize: 15,
          fontWeight: 500,
          color: '#222',
          cursor: 'pointer',
          margin: '8px 0 0 0'
        }}
        onClick={() => {
          setAssets([
            { ticker: 'AAPL', amount: 1200 },
            { ticker: 'TSLA', amount: 800 },
            { ticker: 'BTC', amount: 1500 }
          ]);
          setTicker('');
          setAmount('');
        }}
      >
        Try Example Portfolio
      </button>
      <div style={{ textAlign: 'center', color: '#4b5563', fontSize: 13, margin: '12px 0 18px 0' }}>
        No signup required &bull; Instant analysis
      </div>
      <ul style={{ listStyle: 'none', padding: 0, minHeight: 24 }}>
        {assets.length === 0 ? (
          <li style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', margin: '12px 0' }}>
            No assets added yet. Start by entering a ticker and amount above.
          </li>
        ) : (
          assets.map((asset, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flex: 1 }}>{asset.ticker} - ${asset.amount.toLocaleString()}</span>
              <button onClick={() => handleRemove(idx)} style={{ marginLeft: 8 }}>Remove</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PortfolioInput;

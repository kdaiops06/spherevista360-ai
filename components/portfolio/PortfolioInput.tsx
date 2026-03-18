

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
      <div style={{ color: '#555', fontSize: 15, marginBottom: 14 }}>
        Add your stocks, crypto, or other investments to analyze your risk and diversification instantly.
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="e.g. AAPL, BTC, TSLA"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          placeholder="e.g. 1000 (USD)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: 120 }}
        />
        <button onClick={handleAdd}>Analyze</button>
        <button
          type="button"
          style={{ marginLeft: 8, background: '#f3f4f6', border: '1px solid #ccc', borderRadius: 4, padding: '6px 12px', fontSize: 14, cursor: 'pointer' }}
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
          Example Portfolio
        </button>
      </div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Enter the asset ticker (e.g. AAPL for Apple, BTC for Bitcoin) and the amount invested in USD. Add each asset one by one.
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

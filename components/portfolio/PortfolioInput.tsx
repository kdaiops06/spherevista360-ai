

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
      <h3>Portfolio Input</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Ticker"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          placeholder="Amount (USD)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: 120 }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {assets.map((asset, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ flex: 1 }}>{asset.ticker} - ${asset.amount.toLocaleString()}</span>
            <button onClick={() => handleRemove(idx)} style={{ marginLeft: 8 }}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioInput;

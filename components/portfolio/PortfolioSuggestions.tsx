import React from 'react';

interface PortfolioSuggestionsProps {
  suggestions: string[];
}

const PortfolioSuggestions: React.FC<PortfolioSuggestionsProps> = ({ suggestions }) => {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3>Suggestions</h3>
      {suggestions.length === 0 ? (
        <div>Your portfolio looks balanced</div>
      ) : (
        <>
          <ul style={{ paddingLeft: 20 }}>
            {suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{s}</li>
            ))}
          </ul>
          <div style={{ fontSize: 12, color: '#666', marginTop: 10 }}>
            Well-diversified portfolios typically include multiple assets across sectors.
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioSuggestions;

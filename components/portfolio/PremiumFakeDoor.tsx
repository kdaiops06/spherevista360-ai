import React, { useState } from 'react';

interface PremiumFakeDoorProps {
  onUnlock?: () => void;
}

const PremiumFakeDoor: React.FC<PremiumFakeDoorProps> = ({ onUnlock }) => {
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleUnlock = () => {
    setShowInput(true);
    if (onUnlock) onUnlock();
  };
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
        <>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
            Basic analysis shown above
          </div>
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
            🔒 Get deeper portfolio insights ($9)
          </button>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            No signup required to try the analyzer
          </div>
        </>
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
          Thank you! We&apos;ll notify you when advanced insights are available.
        </div>
      )}
      <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
        Get deeper portfolio analysis, AI forecasts, and personalized optimization strategies.
      </div>
    </div>
  );
};

export default PremiumFakeDoor;
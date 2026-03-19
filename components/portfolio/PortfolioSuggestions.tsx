import React from "react";
import type { PortfolioSuggestion } from "@/lib/portfolio/suggestions";

interface PortfolioSuggestionsProps {
  suggestions: PortfolioSuggestion[];
}

const badgeColor = (confidence: string) => {
  if (confidence === "High") return { background: "#ffeaea", color: "#d32f2f", border: "1px solid #ffcdd2" };
  if (confidence === "Medium") return { background: "#fffbe6", color: "#ad8b00", border: "1px solid #ffe58f" };
  return { background: "#e6f7ff", color: "#1890ff", border: "1px solid #91d5ff" };
};

const PortfolioSuggestions: React.FC<PortfolioSuggestionsProps> = ({ suggestions }) => {
  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#fafbfc" }}>
      <h3 style={{ fontSize: 20, marginBottom: 16 }}>Decision Insights</h3>
      {suggestions.length === 0 ? (
        <div>Your portfolio looks balanced</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 16,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: "#444" }}>
                <span style={{ fontWeight: 500 }}>Why:</span> {s.reason}
              </div>
              <div style={{ fontSize: 14, color: "#444" }}>
                <span style={{ fontWeight: 500 }}>What to do:</span> {s.action}
              </div>
              <div style={{ alignSelf: "flex-end" }}>
                <span
                  style={{
                    ...badgeColor(s.confidence),
                    fontSize: 12,
                    borderRadius: 8,
                    padding: "2px 10px",
                    fontWeight: 500,
                  }}
                >
                  Confidence: {s.confidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioSuggestions;

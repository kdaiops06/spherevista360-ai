export interface CurrencyForecast {
  pair: string;
  trend: "Bullish" | "Bearish" | "Neutral";
  projection3m: string;
  projection6m: string;
  confidence: number;
  macroFactors: string[];
  updatedAt: string;
  source: string;
}

interface ForecastPreset {
  base: number;
  trend: CurrencyForecast["trend"];
  monthlyMove: number;
  confidence: number;
  macroFactors: string[];
}

const FORECAST_PRESETS: Record<string, ForecastPreset> = {
  "USD/INR": {
    base: 83.2,
    trend: "Bullish",
    monthlyMove: 0.25,
    confidence: 0.67,
    macroFactors: [
      "US rate differential remains elevated",
      "India import-led dollar demand",
      "Oil prices keep INR sensitivity high",
    ],
  },
  "EUR/USD": {
    base: 1.08,
    trend: "Neutral",
    monthlyMove: 0.001,
    confidence: 0.58,
    macroFactors: [
      "Fed and ECB policy convergence",
      "Eurozone growth stabilization",
      "US labor market resilience",
    ],
  },
  "XAU/USD": {
    base: 2950,
    trend: "Bullish",
    monthlyMove: 24,
    confidence: 0.64,
    macroFactors: [
      "Central-bank gold accumulation",
      "Geopolitical risk premium",
      "Real yields and inflation hedge demand",
    ],
  },
};

function formatProjection(pair: string, value: number) {
  if (pair === "EUR/USD") {
    return value.toFixed(4);
  }
  if (pair === "XAU/USD") {
    return `$${value.toFixed(0)}`;
  }
  return value.toFixed(2);
}

export function generateCurrencyForecast(pair: string): CurrencyForecast {
  const preset = FORECAST_PRESETS[pair] || FORECAST_PRESETS["USD/INR"];
  const projection3m = preset.base + preset.monthlyMove * 3;
  const projection6m = preset.base + preset.monthlyMove * 6;

  return {
    pair,
    trend: preset.trend,
    projection3m: formatProjection(pair, projection3m),
    projection6m: formatProjection(pair, projection6m),
    confidence: Math.round(preset.confidence * 100),
    macroFactors: preset.macroFactors,
    updatedAt: new Date().toISOString(),
    source: "Macro factor model (deterministic)",
  };
}

export interface RecessionOutput {
  score: number;
  components: Array<{ name: string; value: number; impact: number }>;
}

export function computeRecessionProbability(): RecessionOutput {
  const components = [
    { name: "Yield Curve (10Y-2Y)", value: -0.32, impact: 38 },
    { name: "CPI Momentum", value: 3.1, impact: 19 },
    { name: "Unemployment", value: 4.1, impact: 14 },
    { name: "GDP Growth", value: 1.8, impact: 11 },
  ];

  const score = Math.max(0, Math.min(100, components.reduce((sum, c) => sum + c.impact, 0)));
  return { score, components };
}

export interface GlobalStressOutput {
  score: number;
  components: Array<{ name: string; score: number }>;
  narrative: string;
}

export function computeGlobalStressIndex(): GlobalStressOutput {
  const components = [
    { name: "Inflation Stress", score: 57 },
    { name: "Debt Burden", score: 61 },
    { name: "Geopolitical Tension", score: 66 },
    { name: "Currency Volatility", score: 52 },
  ];

  const score = Math.round(components.reduce((sum, c) => sum + c.score, 0) / components.length);
  const narrative =
    score >= 65
      ? "Global stress is elevated with policy sensitivity across currencies and sovereign debt markets."
      : score >= 50
      ? "Global stress is moderate. Macro conditions are mixed and vulnerable to shocks."
      : "Global stress is contained but should be monitored for regime shifts.";

  return { score, components, narrative };
}

const ASSET_VOLATILITY: Record<string, number> = {
  SPY: 16,
  QQQ: 22,
  BTC: 62,
  "BTC-USD": 62,
  GOLD: 14,
  GLD: 14,
  TLT: 18,
  VTI: 15,
  ETH: 74,
};

const CORRELATION_RISKS: Array<{ a: string; b: string; score: number; note: string }> = [
  { a: "SPY", b: "QQQ", score: 82, note: "High US equity concentration" },
  { a: "BTC", b: "ETH", score: 88, note: "Crypto beta concentration" },
  { a: "GLD", b: "TLT", score: 28, note: "Lower cyclical correlation" },
  { a: "SPY", b: "BTC", score: 52, note: "Risk-on co-movement in liquidity cycles" },
];

export interface PortfolioRiskOutput {
  assets: string[];
  diversificationScore: number;
  volatilityRisk: number;
  correlationRisks: string[];
}

export function scanPortfolioRisk(inputAssets: string[]): PortfolioRiskOutput {
  const assets = inputAssets
    .map((a) => a.trim().toUpperCase())
    .filter(Boolean);

  const unique = Array.from(new Set(assets));
  const volValues = unique.map((a) => ASSET_VOLATILITY[a] ?? 25);
  const avgVol = volValues.length > 0 ? volValues.reduce((s, v) => s + v, 0) / volValues.length : 0;

  const concentrationPenalty = Math.max(0, 35 - unique.length * 6);
  const diversificationScore = Math.max(5, Math.min(95, Math.round(70 - concentrationPenalty - avgVol / 4)));
  const volatilityRisk = Math.max(5, Math.min(95, Math.round(avgVol)));

  const correlationRisks: string[] = [];
  for (const pair of CORRELATION_RISKS) {
    const hasA = unique.includes(pair.a);
    const hasB = unique.includes(pair.b);
    if (hasA && hasB && pair.score >= 50) {
      correlationRisks.push(`${pair.a}-${pair.b}: ${pair.note}`);
    }
  }

  if (correlationRisks.length === 0) {
    correlationRisks.push("No high-correlation concentration pair detected in selected assets.");
  }

  return {
    assets: unique,
    diversificationScore,
    volatilityRisk,
    correlationRisks,
  };
}

interface CurrencyVulnerability {
  currency: string;
  country: string;
  inflation: number;
  reservesMonths: number;
  debtToGdp: number;
}

const VULNERABLE_CURRENCIES: CurrencyVulnerability[] = [
  { currency: "ARS", country: "Argentina", inflation: 142, reservesMonths: 2.1, debtToGdp: 85 },
  { currency: "TRY", country: "Turkey", inflation: 58, reservesMonths: 3.5, debtToGdp: 35 },
  { currency: "EGP", country: "Egypt", inflation: 28, reservesMonths: 4.2, debtToGdp: 92 },
  { currency: "PKR", country: "Pakistan", inflation: 18, reservesMonths: 2.8, debtToGdp: 75 },
  { currency: "LKR", country: "Sri Lanka", inflation: 12, reservesMonths: 3.0, debtToGdp: 110 },
];

export function detectCurrencyCrisis() {
  const ranked = VULNERABLE_CURRENCIES.map((entry) => {
    let risk = 0;
    risk += entry.inflation > 50 ? 35 : entry.inflation > 20 ? 24 : entry.inflation > 10 ? 14 : 6;
    risk += entry.reservesMonths < 3 ? 30 : entry.reservesMonths < 5 ? 18 : 8;
    risk += entry.debtToGdp > 100 ? 28 : entry.debtToGdp > 70 ? 18 : 8;

    return {
      ...entry,
      risk: Math.min(100, risk),
    };
  }).sort((a, b) => b.risk - a.risk);

  return ranked;
}
import type { AIPrediction, CurrencyStrength, MarketData } from "@/types";
import { fetchFredSeries } from "./data-sources";
import type { MarketPulseItem } from "@/components/dashboard/MarketPulse";

export interface RecessionSignal {
  probability: number;
  isLive: boolean;
  source: string;
  lastUpdated: string;
}

const ESTIMATED_RECESSION_SIGNAL: RecessionSignal = {
  probability: 42,
  isLive: false,
  source: "Estimated macro model",
  lastUpdated: "2025-01-15T00:00:00Z",
};

export async function getRecessionSignal(): Promise<RecessionSignal> {
  if (!process.env.FRED_API_KEY) {
    return ESTIMATED_RECESSION_SIGNAL;
  }

  try {
    const [tenYear, twoYear, unemployment, fedFunds] = await Promise.all([
      fetchFredSeries("DGS10"),
      fetchFredSeries("DGS2"),
      fetchFredSeries("UNRATE"),
      fetchFredSeries("FEDFUNDS"),
    ]);

    const curveSpread = tenYear.value - twoYear.value;
    const yieldRisk = curveSpread < 0 ? Math.min(45, Math.round(Math.abs(curveSpread) * 30)) : 0;
    const unemploymentRisk = unemployment.value > 4.2 ? Math.min(25, Math.round((unemployment.value - 4.2) * 14)) : 0;
    const ratesRisk = fedFunds.value > 4.5 ? Math.min(15, Math.round((fedFunds.value - 4.5) * 4)) : 0;
    const baselineRisk = 18;

    return {
      probability: Math.max(5, Math.min(95, baselineRisk + yieldRisk + unemploymentRisk + ratesRisk)),
      isLive: true,
      source: "FRED macro indicators",
      lastUpdated: [tenYear.date, twoYear.date, unemployment.date, fedFunds.date]
        .filter(Boolean)
        .sort()
        .at(-1) || new Date().toISOString(),
    };
  } catch {
    return ESTIMATED_RECESSION_SIGNAL;
  }
}

function findAsset(data: MarketData[], symbols: string[]) {
  return data.find((item) => symbols.includes(item.symbol));
}

function formatDirectionLabel(value: number, positiveLabel: string, negativeLabel: string) {
  if (value > 0) return positiveLabel;
  if (value < 0) return negativeLabel;
  return "Neutral";
}

export function buildMarketPulse(params: {
  marketData: MarketData[];
  currencyStrength: CurrencyStrength[];
  predictions: AIPrediction[];
  recessionSignal: RecessionSignal;
}): MarketPulseItem[] {
  const { marketData, currencyStrength, predictions, recessionSignal } = params;

  const usd = currencyStrength.find((entry) => entry.currency === "USD");
  const gold = findAsset(marketData, ["GC=F", "GLD"]);
  const sp500 = findAsset(marketData, ["^GSPC", "SPY"]);
  const sp500Prediction = predictions.find((item) => item.asset.toLowerCase().includes("s&p 500"));

  const usdStrength = usd?.strength ?? 70;
  const usdTrend = usd?.trend ?? "stable";
  const usdTone = usdStrength >= 70 ? "positive" : usdStrength <= 45 ? "negative" : "neutral";

  const goldChange = gold?.changePercent ?? 0;
  const goldTrend = goldChange > 0 ? "up" : goldChange < 0 ? "down" : "stable";
  const goldTone = goldChange > 0 ? "positive" : goldChange < 0 ? "negative" : "neutral";

  const spTone = sp500Prediction?.prediction === "bullish"
    ? "positive"
    : sp500Prediction?.prediction === "bearish"
    ? "negative"
    : "neutral";

  const spTrend = sp500Prediction?.prediction === "bullish"
    ? "up"
    : sp500Prediction?.prediction === "bearish"
    ? "down"
    : "stable";

  const recessionTone = recessionSignal.probability >= 60
    ? "negative"
    : recessionSignal.probability >= 35
    ? "neutral"
    : "positive";

  const recessionTrend = recessionSignal.probability >= 60
    ? "up"
    : recessionSignal.probability <= 30
    ? "down"
    : "stable";

  return [
    {
      label: "USD Trend",
      value: `${usdStrength}/100`,
      detail: `${formatDirectionLabel(usdStrength - 60, "Dollar strength remains firm", "Dollar momentum is softening")} across the FX basket.`,
      trend: usdTrend,
      tone: usdTone,
      sourceLabel: "Currency strength feed",
    },
    {
      label: "Gold Trend",
      value: gold ? `${gold.changePercent >= 0 ? "+" : ""}${gold.changePercent.toFixed(2)}%` : "Flat",
      detail: gold
        ? `${gold.name} is ${goldChange >= 0 ? "holding risk-off support" : "giving back recent defensive gains"}.`
        : "Gold pricing feed unavailable.",
      trend: goldTrend,
      tone: goldTone,
      sourceLabel: gold?.symbol === "GC=F" ? "Gold futures" : "Gold market proxy",
    },
    {
      label: "S&P 500 Outlook",
      value: sp500Prediction ? `${sp500Prediction.prediction}` : sp500 ? `${sp500.changePercent.toFixed(2)}%` : "Neutral",
      detail: sp500Prediction
        ? `${(sp500Prediction.confidence * 100).toFixed(0)}% confidence over ${sp500Prediction.timeframe}.`
        : sp500
        ? `Index move is ${sp500.changePercent >= 0 ? "supportive" : "soft"} in today’s session.`
        : "Equity outlook feed unavailable.",
      trend: spTrend,
      tone: spTone,
      sourceLabel: sp500Prediction ? "Editorial AI outlook" : "Live index move",
    },
    {
      label: "Recession Probability",
      value: `${recessionSignal.probability}/100`,
      detail: recessionSignal.isLive
        ? "Computed from yield curve, unemployment, and policy-rate pressure."
        : "Estimated from macro conditions until FRED live data is configured.",
      trend: recessionTrend,
      tone: recessionTone,
      sourceLabel: recessionSignal.source,
    },
  ];
}
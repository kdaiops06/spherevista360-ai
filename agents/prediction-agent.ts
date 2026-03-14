import { generateWithClaude } from "@/lib/ai/client";
import type { AIPrediction, MarketData, EconomicIndicator } from "@/types";

const SYSTEM_PROMPT = `You are an AI market prediction analyst for SphereVista360. You analyze financial data and economic indicators to generate market outlook predictions.

Important rules:
- Predictions are educational/analytical, not financial advice
- Always express uncertainty and confidence levels
- Base predictions on data and established economic relationships
- Never guarantee outcomes
- Include strong disclaimers`;

export async function generatePredictions(
  marketData: MarketData[],
  indicators: EconomicIndicator[]
): Promise<AIPrediction[]> {
  const marketText = marketData
    .map((m) => `${m.symbol}: $${m.price} (${m.changePercent}%)`)
    .join("\n");

  const indicatorText = indicators
    .map((i) => `${i.name}: ${i.value}${i.unit}`)
    .join("\n");

  const prompt = `Based on the following market data and economic indicators, generate AI market outlook predictions for major assets.

Market Data:
${marketText}

Economic Indicators:
${indicatorText}

Generate predictions for: S&P 500, Gold, EUR/USD, Bitcoin, 10Y Treasury

Format as JSON array:
[{
  "asset": "S&P 500",
  "prediction": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "timeframe": "1 week|1 month|3 months",
  "reasoning": "brief reasoning..."
}, ...]`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const predictions = JSON.parse(jsonMatch[0]) as AIPrediction[];
  return predictions.map((p) => ({
    ...p,
    generatedAt: new Date().toISOString(),
  }));
}

export const predictionAgent = {
  name: "prediction-agent",
  description: "Generates AI market outlook predictions",
  generatePredictions,
};

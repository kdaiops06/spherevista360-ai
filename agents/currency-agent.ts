import { generateWithClaude } from "@/lib/ai/client";
import { fetchExchangeRates } from "@/lib/data-sources";
import type { CurrencyRate, CurrencyStrength } from "@/types";

const SYSTEM_PROMPT = `You are a senior currency analyst for SphereVista360. You specialize in forex markets, currency trends, and macroeconomic factors affecting exchange rates.

Your role:
- Analyze currency movements and trends
- Provide context on central bank policies
- Write clear SEO-optimized currency analysis articles
- Never give direct trading advice
- Always include informational disclaimers`;

const MAJOR_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD",
  "CNY", "INR", "SGD", "HKD",
];

export async function fetchCurrencyData(): Promise<CurrencyRate[]> {
  const rates = await fetchExchangeRates("USD");
  return rates.filter((r) => MAJOR_CURRENCIES.includes(r.target));
}

export async function analyzeCurrencyStrength(
  rates: CurrencyRate[]
): Promise<CurrencyStrength[]> {
  const ratesText = rates
    .map((r) => `${r.base}/${r.target}: ${r.rate}`)
    .join("\n");

  const response = await generateWithClaude(
    SYSTEM_PROMPT,
    `Analyze the following USD exchange rates and rank the currencies by relative strength. For each currency, provide a strength score (0-100), estimated 24h change direction, and trend.

Rates:
${ratesText}

Respond in JSON array format:
[{"currency": "USD", "strength": 75, "change24h": 0.5, "trend": "up"}, ...]`
  );

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}

export async function generateCurrencyArticle(
  rates: CurrencyRate[]
): Promise<{
  title: string;
  description: string;
  content: string;
  tags: string[];
  keywords: string[];
}> {
  const ratesText = rates
    .map((r) => `${r.base}/${r.target}: ${r.rate}`)
    .join("\n");

  const prompt = `Write a comprehensive currency market analysis article based on today's exchange rates.

Current rates (vs USD):
${ratesText}

Requirements:
1. SEO-friendly title including today's date context
2. 150-char meta description
3. Analyze major currency pairs
4. Discuss factors affecting rates
5. Include key takeaways
6. 800-1200 words
7. Add disclaimer

Format as JSON:
{
  "title": "...",
  "description": "...",
  "content": "... (full MDX) ...",
  "tags": ["...", "..."],
  "keywords": ["...", "..."]
}`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 8192);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse currency article JSON");
  return JSON.parse(jsonMatch[0]);
}

export const currencyAgent = {
  name: "currency-agent",
  description: "Fetches currency data, analyzes strength, generates articles",
  fetchCurrencyData,
  analyzeCurrencyStrength,
  generateCurrencyArticle,
};

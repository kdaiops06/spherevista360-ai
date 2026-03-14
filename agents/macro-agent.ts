import { generateWithClaude } from "@/lib/ai/client";
import { fetchKeyEconomicIndicators } from "@/lib/data-sources";
import type { EconomicIndicator } from "@/types";

const SYSTEM_PROMPT = `You are a senior macroeconomic analyst for SphereVista360. You specialize in economic indicators, monetary policy, inflation trends, and GDP analysis.

Your role:
- Analyze economic data and indicators
- Write detailed macro analysis articles
- Explain complex economic concepts clearly
- Never give direct investment advice
- Always include informational disclaimers`;

export async function fetchMacroData(): Promise<EconomicIndicator[]> {
  return fetchKeyEconomicIndicators();
}

export async function generateMacroArticle(
  indicators: EconomicIndicator[]
): Promise<{
  title: string;
  description: string;
  content: string;
  tags: string[];
  keywords: string[];
}> {
  const dataText = indicators
    .map(
      (i) =>
        `${i.name}: ${i.value}${i.unit} (previous: ${i.previousValue}${i.unit}) - ${i.date}`
    )
    .join("\n");

  const prompt = `Write a comprehensive macroeconomic analysis article based on the latest economic indicators.

Current Economic Data:
${dataText}

Requirements:
1. SEO-friendly title reflecting current economic conditions
2. 150-char meta description
3. Analyze each indicator and its implications
4. Discuss Fed policy direction
5. Include outlook section
6. Key takeaways
7. 800-1200 words
8. Disclaimer

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
  if (!jsonMatch) throw new Error("Failed to parse macro article JSON");
  return JSON.parse(jsonMatch[0]);
}

export const macroAgent = {
  name: "macro-agent",
  description: "Fetches economic indicators and generates macro analysis",
  fetchMacroData,
  generateMacroArticle,
};

import { generateWithClaude } from "@/lib/ai/client";

const SYSTEM_PROMPT = `You are a senior financial content strategist for SphereVista360, an AI-powered financial intelligence platform.

Your role:
- Create high-quality, SEO-optimized financial content
- Structure content with proper headings, lists, and explanations
- Write in a professional but accessible tone
- Include relevant financial data and statistics
- Add internal links to related tools and pages
- Never provide direct financial advice
- Always include disclaimers

Output: Write in clean Markdown (MDX compatible).`;

export async function generateComparisonArticle(
  asset1: string,
  asset2: string
): Promise<{
  title: string;
  description: string;
  content: string;
  tags: string[];
}> {
  const prompt = `Write a comprehensive comparison article: "${asset1} vs ${asset2}" for investors.

Requirements:
1. SEO-optimized title
2. 150-char meta description
3. Structured content with:
   - Introduction
   - Historical Performance
   - Risk Comparison
   - Pros & Cons of each
   - When to choose each
   - Conclusion
4. 1500-2000 words
5. Include data points and statistics
6. Include disclaimer

Return JSON:
{
  "title": "...",
  "description": "...",
  "content": "...(markdown)...",
  "tags": ["tag1", "tag2"]
}`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 4096);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      title: `${asset1} vs ${asset2}: Complete Comparison`,
      description: `Compare ${asset1} and ${asset2} as investments. Performance, risk, and which is better for your portfolio.`,
      content: response,
      tags: [asset1.toLowerCase(), asset2.toLowerCase(), "comparison", "investing"],
    };
  }
  return JSON.parse(jsonMatch[0]);
}

export async function generateInflationArticle(
  country: string,
  year: string
): Promise<{
  title: string;
  description: string;
  content: string;
  tags: string[];
}> {
  const prompt = `Write an SEO article about inflation in ${country} for ${year}.

Include:
- Current inflation rate
- Historical context
- Impact on consumers
- Central bank response
- Outlook

Return JSON:
{
  "title": "...",
  "description": "...",
  "content": "...(markdown)...",
  "tags": ["tag1", "tag2"]
}`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 4096);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      title: `Inflation in ${country} (${year})`,
      description: `Track inflation rates in ${country} for ${year}. Analysis, impact, and outlook.`,
      content: response,
      tags: ["inflation", country.toLowerCase(), year],
    };
  }
  return JSON.parse(jsonMatch[0]);
}

export async function generateInvestmentGuide(
  topic: string
): Promise<{
  title: string;
  description: string;
  content: string;
  tags: string[];
}> {
  const prompt = `Write an SEO-optimized investment guide about: "${topic}"

Include:
- What it is
- How it works
- Benefits and risks
- How to get started
- Expert tips
- FAQ section (3-5 questions)

Return JSON:
{
  "title": "...",
  "description": "...",
  "content": "...(markdown)...",
  "tags": ["tag1", "tag2"]
}`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 4096);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      title: `Investment Guide: ${topic}`,
      description: `Complete guide to ${topic}. Learn how to invest, benefits, risks, and expert tips.`,
      content: response,
      tags: ["investing", "guide", topic.toLowerCase()],
    };
  }
  return JSON.parse(jsonMatch[0]);
}

export const contentAgent = {
  generateComparisonArticle,
  generateInflationArticle,
  generateInvestmentGuide,
};

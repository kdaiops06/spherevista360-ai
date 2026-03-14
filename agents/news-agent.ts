import { generateWithClaude } from "@/lib/ai/client";
import { fetchFinanceNews, fetchRedditPosts } from "@/lib/data-sources";
import type { NewsItem } from "@/types";

const SYSTEM_PROMPT = `You are a senior financial news analyst and writer for SphereVista360, an AI-powered financial intelligence platform.

Your role:
- Analyze financial news and market developments
- Write clear, SEO-optimized articles
- Provide balanced, factual analysis
- Never give direct financial advice
- Always include disclaimers about informational purposes

Output format: Write in Markdown (MDX compatible). Include headers, bullet points, and clear structure.`;

export async function fetchLatestNews(): Promise<NewsItem[]> {
  const [newsApi, reddit] = await Promise.allSettled([
    fetchFinanceNews("stock market economy finance"),
    fetchRedditPosts("wallstreetbets"),
  ]);

  const news: NewsItem[] = [];
  if (newsApi.status === "fulfilled") news.push(...newsApi.value);
  if (reddit.status === "fulfilled") news.push(...reddit.value);

  return news;
}

export async function summarizeNews(
  newsItems: NewsItem[]
): Promise<string> {
  const headlines = newsItems
    .slice(0, 10)
    .map((n, i) => `${i + 1}. ${n.title} (${n.source})`)
    .join("\n");

  return generateWithClaude(
    SYSTEM_PROMPT,
    `Summarize the following financial news headlines into a concise market briefing (300-400 words). Identify key themes, market sentiment, and notable developments.\n\nHeadlines:\n${headlines}`
  );
}

export async function generateNewsArticle(
  topic: string,
  context: string
): Promise<{
  title: string;
  description: string;
  content: string;
  tags: string[];
  keywords: string[];
}> {
  const prompt = `Write a comprehensive, SEO-optimized article about the following financial topic.

Topic: ${topic}
Context/Source Data: ${context}

Requirements:
1. Create an engaging, SEO-friendly title
2. Write a 150-character meta description
3. Structure with H2 and H3 headers
4. Include key takeaways section
5. Include a disclaimer about not being financial advice
6. Target 800-1200 words
7. Suggest 5 relevant tags
8. Suggest 5 SEO keywords

Format your response as JSON with this structure:
{
  "title": "...",
  "description": "...",
  "content": "... (full MDX article content) ...",
  "tags": ["...", "..."],
  "keywords": ["...", "..."]
}`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 8192);

  // Parse JSON from response (handle potential markdown code block wrapping)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse article JSON from AI response");

  return JSON.parse(jsonMatch[0]);
}

export const newsAgent = {
  name: "news-agent",
  description: "Fetches financial news, summarizes, and generates SEO articles",
  fetchLatestNews,
  summarizeNews,
  generateNewsArticle,
};

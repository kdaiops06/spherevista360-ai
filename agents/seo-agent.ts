import { generateWithClaude } from "@/lib/ai/client";
import type { Article, SEOMeta } from "@/types";
import { slugify, SITE_CONFIG } from "@/lib/utils";

const SYSTEM_PROMPT = `You are an SEO specialist for SphereVista360, a financial intelligence platform. You optimize content for search engines while maintaining readability and quality.

Expertise:
- Keyword research and optimization
- Meta tag generation
- Schema markup (JSON-LD)
- Internal linking strategies
- Content structure optimization`;

export async function generateSEOMetadata(
  title: string,
  content: string,
  category: string
): Promise<SEOMeta> {
  const prompt = `Generate SEO metadata for a financial article.

Title: ${title}
Category: ${category}
Content Preview: ${content.slice(0, 500)}

Return JSON:
{
  "title": "SEO-optimized title (50-60 chars)",
  "description": "Meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", ...]
}`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 1024);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { title, description: content.slice(0, 160), keywords: [] };
  }
  return JSON.parse(jsonMatch[0]);
}

export function generateArticleSchema(article: Article): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/images/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/news/${article.slug}`,
    },
    keywords: article.tags.join(", "),
  };
}

export function generateToolSchema(
  toolName: string,
  description: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: toolName,
    description,
    url: `${SITE_CONFIG.url}/tools/${slugify(toolName)}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export async function generateInternalLinks(
  currentArticle: string,
  allArticles: Article[]
): Promise<{ text: string; url: string }[]> {
  const titles = allArticles
    .filter((a) => a.slug !== currentArticle)
    .slice(0, 20)
    .map((a) => `- ${a.title} (/${a.category}/${a.slug})`)
    .join("\n");

  const prompt = `Given the current article and available articles, suggest 3-5 relevant internal links.

Current article: ${currentArticle}
Available articles:
${titles}

Return JSON array: [{"text": "anchor text", "url": "/category/slug"}, ...]`;

  const response = await generateWithClaude(SYSTEM_PROMPT, prompt, 1024);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}

export const seoAgent = {
  name: "seo-agent",
  description: "Generates SEO metadata, schema, and internal links",
  generateSEOMetadata,
  generateArticleSchema,
  generateToolSchema,
  generateInternalLinks,
};

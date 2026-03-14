/**
 * generate-article.ts
 * Uses AI agents to generate SEO-optimized financial articles from fetched news.
 * Run: npx tsx scripts/generate-article.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { newsAgent } from "../agents/news-agent";
import { currencyAgent } from "../agents/currency-agent";
import { macroAgent } from "../agents/macro-agent";
import { seoAgent } from "../agents/seo-agent";
import { saveArticleAsMDX } from "../lib/content";
import { slugify } from "../lib/utils";
import type { NewsItem } from "../types";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const ARTICLES_TO_GENERATE = parseInt(process.env.ARTICLES_COUNT || "3", 10);

async function generateNewsArticle(newsItems: NewsItem[]): Promise<string | null> {
  try {
    const summary = await newsAgent.summarizeNews(newsItems);
    const article = await newsAgent.generateNewsArticle(
      "Market Briefing and Financial News Recap",
      summary
    );

    const slug = slugify(article.title);
    const savedPath = saveArticleAsMDX({
      slug,
      category: "finance",
      ...article,
    });
    console.log(`  ✅ Finance article saved: ${savedPath}`);
    return savedPath;
  } catch (error) {
    console.error("  ❌ Failed to generate news article:", error);
    return null;
  }
}

async function generateCurrencyArticle(): Promise<string | null> {
  try {
    const rates = await currencyAgent.fetchCurrencyData();
    const article = await currencyAgent.generateCurrencyArticle(rates);

    const slug = slugify(article.title);
    const savedPath = saveArticleAsMDX({
      slug,
      category: "currencies",
      ...article,
    });
    console.log(`  ✅ Currency article saved: ${savedPath}`);
    return savedPath;
  } catch (error) {
    console.error("  ❌ Failed to generate currency article:", error);
    return null;
  }
}

async function generateMacroArticle(): Promise<string | null> {
  try {
    const indicators = await macroAgent.fetchMacroData();
    const article = await macroAgent.generateMacroArticle(indicators);

    const slug = slugify(article.title);
    const savedPath = saveArticleAsMDX({
      slug,
      category: "macro",
      ...article,
    });
    console.log(`  ✅ Macro article saved: ${savedPath}`);
    return savedPath;
  } catch (error) {
    console.error("  ❌ Failed to generate macro article:", error);
    return null;
  }
}

async function main() {
  console.log(`\n🤖 Generating ${ARTICLES_TO_GENERATE} articles...\n`);

  // Load cached news data
  const newsPath = path.join(CACHE_DIR, "latest-news.json");
  let newsItems: NewsItem[] = [];
  if (fs.existsSync(newsPath)) {
    newsItems = JSON.parse(fs.readFileSync(newsPath, "utf-8"));
    console.log(`📋 Loaded ${newsItems.length} cached news items`);
  }

  const generators = [
    () => generateNewsArticle(newsItems),
    () => generateCurrencyArticle(),
    () => generateMacroArticle(),
  ];

  const savedPaths: string[] = [];

  for (let i = 0; i < Math.min(ARTICLES_TO_GENERATE, generators.length); i++) {
    console.log(`\n📝 Generating article ${i + 1}/${ARTICLES_TO_GENERATE}...`);
    const result = await generators[i]();
    if (result) savedPaths.push(result);
  }

  // Save list of generated articles for publish-post.ts
  const outputPath = path.join(CACHE_DIR, "generated-articles.json");
  fs.writeFileSync(outputPath, JSON.stringify(savedPaths, null, 2), "utf-8");

  console.log(`\n🎉 Generated ${savedPaths.length} articles`);
}

main();

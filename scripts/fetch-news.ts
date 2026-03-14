/**
 * fetch-news.ts
 * Fetches latest financial news from multiple sources.
 * Run: npx tsx scripts/fetch-news.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { newsAgent } from "../agents/news-agent";

const OUTPUT_DIR = path.join(process.cwd(), ".cache");

async function main() {
  console.log("📰 Fetching latest financial news...\n");

  // Ensure cache directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    const news = await newsAgent.fetchLatestNews();
    console.log(`✅ Fetched ${news.length} news items\n`);

    // Save raw news data for generate-article.ts to consume
    const outputPath = path.join(OUTPUT_DIR, "latest-news.json");
    fs.writeFileSync(outputPath, JSON.stringify(news, null, 2), "utf-8");
    console.log(`💾 Saved to ${outputPath}`);

    // Print headlines
    news.slice(0, 10).forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.source}] ${item.title}`);
    });
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    process.exit(1);
  }
}

main();

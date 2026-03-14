/**
 * generate-currency-pages.ts
 * Generates a sitemap of all currency pair pages and pre-warms ISR cache.
 * Run: npx tsx scripts/generate-currency-pages.ts
 */

import fs from "fs";
import path from "path";
import { CURRENCY_LIST, generateAllPairs } from "../lib/currency-pairs";

const OUTPUT_DIR = path.join(process.cwd(), ".cache");
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function main() {
  console.log("💱 Generating currency pair pages data...\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const pairs = generateAllPairs();
  console.log(`📊 Total currency pairs: ${pairs.length}`);
  console.log(`🏦 Total currencies: ${CURRENCY_LIST.length}\n`);

  // Save pairs manifest
  const manifestPath = path.join(OUTPUT_DIR, "currency-pairs.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        totalPairs: pairs.length,
        totalCurrencies: CURRENCY_LIST.length,
        currencies: CURRENCY_LIST.map((c) => c.code),
      },
      null,
      2
    ),
    "utf-8"
  );
  console.log(`💾 Saved manifest to ${manifestPath}`);

  // Generate currency pairs sitemap
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spherevista360.com";
  const today = new Date().toISOString().split("T")[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const pair of pairs) {
    sitemap += `  <url>
    <loc>${baseUrl}/${pair.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  sitemap += `</urlset>`;

  const sitemapPath = path.join(PUBLIC_DIR, "sitemap-currencies.xml");
  fs.writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log(`🗺️  Saved sitemap to ${sitemapPath}`);
  console.log(`\n✅ Done! ${pairs.length} currency pair pages configured.`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

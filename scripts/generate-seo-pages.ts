/**
 * generate-seo-pages.ts
 * Generates SEO metadata, robots.txt, and main sitemap for all pages.
 * Run: npx tsx scripts/generate-seo-pages.ts
 */

import fs from "fs";
import path from "path";
import { CURRENCY_LIST } from "../lib/currency-pairs";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const OUTPUT_DIR = path.join(process.cwd(), ".cache");

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/dashboard", priority: "0.9", changefreq: "hourly" },
  { path: "/tools", priority: "0.9", changefreq: "weekly" },
  { path: "/tools/currency-converter", priority: "0.8", changefreq: "daily" },
  { path: "/tools/compound-interest", priority: "0.8", changefreq: "weekly" },
  { path: "/tools/inflation-calculator", priority: "0.8", changefreq: "weekly" },
  { path: "/tools/emi-calculator", priority: "0.8", changefreq: "weekly" },
  { path: "/tools/sip-calculator", priority: "0.8", changefreq: "weekly" },
  { path: "/tools/investment-return", priority: "0.8", changefreq: "weekly" },
  { path: "/tools/currency-strength", priority: "0.8", changefreq: "daily" },
  { path: "/tools/recession-tracker", priority: "0.8", changefreq: "daily" },
  { path: "/tools/currency-crisis", priority: "0.8", changefreq: "daily" },
  { path: "/tools/gold-vs-dollar", priority: "0.8", changefreq: "weekly" },
  { path: "/currencies", priority: "0.8", changefreq: "daily" },
  { path: "/predictions", priority: "0.7", changefreq: "daily" },
  { path: "/articles", priority: "0.7", changefreq: "daily" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

async function main() {
  console.log("🔍 Generating SEO pages...\n");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spherevista360.com";
  const today = new Date().toISOString().split("T")[0];

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Generate main sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-currencies.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf-8");
  console.log("🗺️  Generated sitemap.xml (index)");

  // 2. Generate main sitemap with static pages
  let mainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const page of STATIC_PAGES) {
    mainSitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  mainSitemap += `</urlset>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-main.xml"), mainSitemap, "utf-8");
  console.log(`🗺️  Generated sitemap-main.xml (${STATIC_PAGES.length} pages)`);

  // 3. Generate robots.txt
  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-main.xml
Sitemap: ${baseUrl}/sitemap-currencies.xml

User-agent: GPTBot
Disallow: /api/
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robots, "utf-8");
  console.log("🤖 Generated robots.txt");

  // 4. Generate SEO stats
  const totalCurrencyPairs = CURRENCY_LIST.length * (CURRENCY_LIST.length - 1);
  const stats = {
    generated: new Date().toISOString(),
    staticPages: STATIC_PAGES.length,
    currencyPairPages: totalCurrencyPairs,
    totalPages: STATIC_PAGES.length + totalCurrencyPairs,
    currencies: CURRENCY_LIST.length,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "seo-stats.json"),
    JSON.stringify(stats, null, 2),
    "utf-8"
  );

  console.log(`\n📊 SEO Stats:`);
  console.log(`   Static pages: ${stats.staticPages}`);
  console.log(`   Currency pair pages: ${stats.currencyPairPages}`);
  console.log(`   Total indexable pages: ${stats.totalPages}`);
  console.log(`\n✅ Done!`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

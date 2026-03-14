/**
 * publish-post.ts
 * Commits generated articles to GitHub and triggers deployment.
 * Run: npx tsx scripts/publish-post.ts
 */

import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");

function run(cmd: string): string {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

async function main() {
  console.log("\n🚀 Publishing generated articles...\n");

  // Load generated article paths
  const articlesPath = path.join(CACHE_DIR, "generated-articles.json");
  if (!fs.existsSync(articlesPath)) {
    console.log("⚠️  No generated articles found. Run generate-article.ts first.");
    process.exit(0);
  }

  const articlePaths: string[] = JSON.parse(
    fs.readFileSync(articlesPath, "utf-8")
  );

  if (articlePaths.length === 0) {
    console.log("⚠️  No articles to publish.");
    process.exit(0);
  }

  console.log(`📄 ${articlePaths.length} articles to publish:\n`);
  articlePaths.forEach((p) => console.log(`  - ${path.relative(process.cwd(), p)}`));

  try {
    // Configure git for CI environment
    try {
      run('git config user.email "ai-agent@spherevista360.com"');
      run('git config user.name "SphereVista360 AI Agent"');
    } catch {
      // Config may already exist
    }

    // Stage content files
    run("git add content/");

    // Check if there are changes to commit
    try {
      run("git diff --cached --quiet");
      console.log("\n✅ No changes to commit.");
      return;
    } catch {
      // Changes exist, proceed with commit
    }

    // Commit
    const date = new Date().toISOString().split("T")[0];
    const commitMsg = `📰 Auto-publish: ${articlePaths.length} articles (${date})`;
    run(`git commit -m "${commitMsg}"`);
    console.log(`\n✅ Committed: ${commitMsg}`);

    // Push (only in CI or if remote is configured)
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
      run("git push");
      console.log("✅ Pushed to remote. Vercel deployment will trigger automatically.");
    } else {
      console.log(
        "\n💡 Run 'git push' to deploy. Vercel will auto-deploy on push."
      );
    }

    // Clean up cache
    if (fs.existsSync(articlesPath)) {
      fs.unlinkSync(articlesPath);
    }
    const newsCache = path.join(CACHE_DIR, "latest-news.json");
    if (fs.existsSync(newsCache)) {
      fs.unlinkSync(newsCache);
    }

    console.log("\n🎉 Publishing complete!");
  } catch (error) {
    console.error("❌ Publishing failed:", error);
    process.exit(1);
  }
}

main();

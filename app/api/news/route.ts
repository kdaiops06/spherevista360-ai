import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/fetch-live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  let fallbackUsed = false;
  let articles: any[] = [];
  let raw: any = null;
  let isLive = false;
  let source = "";
  let lastUpdated = null;

  try {
    const newsResult = await getLatestNews();
    isLive = newsResult.isLive;
    source = newsResult.source;
    lastUpdated = newsResult.lastUpdated;
    raw = newsResult.data;

    // STEP 2: HARD VALIDATION
    if (!raw) {
      throw new Error("No data returned from news API");
    }

    // STEP 3: IMPROVED DEBUG LOGGING
    console.log("NEWS DEBUG:", {
      hasData: !!raw,
      keys: raw ? Object.keys(raw) : null,
      isArray: Array.isArray(raw),
      articlesCount: raw?.articles?.length,
      itemsCount: raw?.items?.length,
      resultsCount: raw?.results?.length
    });

    // STEP 1: FIX DATA EXTRACTION (CRITICAL)
    if (Array.isArray(raw?.articles)) {
      articles = raw.articles;
    } else if (Array.isArray(raw?.items)) {
      articles = raw.items;
    } else if (Array.isArray(raw?.results)) {
      articles = raw.results;
    } else {
      console.warn("Invalid news format:", raw);
    }

    // STEP 4: SAFE NORMALIZATION
    const normalized = Array.isArray(articles)
      ? articles.map((item: any) => ({
          title: item.title || item.headline || "No title",
          url: item.url || item.link || "#",
          source: item.source?.name || item.source || "Unknown",
          publishedAt:
            item.publishedAt || item.pubDate || item.date || new Date().toISOString(),
        }))
      : [];

    // STEP 5: SORT AFTER NORMALIZATION
    const sorted = normalized.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // STEP 6: FIX FALLBACK LOGIC
    if (!sorted.length) {
      console.warn("No valid articles after normalization");
      fallbackUsed = true;
    }

    // STEP 7: RESPONSE FORMAT
    return NextResponse.json({
      articles: sorted,
      fallbackUsed,
      isLive,
      source,
      lastUpdated,
    });
  } catch (err) {
    fallbackUsed = true;
    console.error("NEWS API ERROR:", err);
    return NextResponse.json({
      articles: [],
      fallbackUsed: true,
      isLive: false,
      source: "Error",
      lastUpdated: null,
    });
  }
}

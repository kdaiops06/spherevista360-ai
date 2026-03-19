import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/fetch-live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  let debugInfo = {};
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
    // STEP 1: LOG RAW API RESPONSE
    console.log("NEWS RAW RESPONSE:", raw);

    // STEP 2: IDENTIFY CORRECT DATA PATH
    articles = raw.articles || raw.items || raw.results || raw || [];

    // STEP 3: MAP DATA SAFELY
    const normalized = Array.isArray(articles)
      ? articles.map((item: any) => ({
          title: item.title || item.headline || "No title",
          url: item.url || item.link || "#",
          source: item.source?.name || item.source || "Unknown",
          publishedAt:
            item.publishedAt || item.pubDate || item.date || new Date().toISOString(),
        }))
      : [];

    // STEP 4: FIX FILTER BUG (no strict filter)
    // STEP 5: FIX SORTING (AFTER NORMALIZATION)
    const sorted = normalized.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // STEP 6: FIX FALLBACK LOGIC
    if (!sorted.length || sorted.every((a) => a.title === "No title")) {
      fallbackUsed = true;
      console.warn("Using fallback news data");
    }

    debugInfo = {
      rawType: typeof raw,
      rawKeys: raw && typeof raw === "object" ? Object.keys(raw) : null,
      count: sorted.length,
      fallbackUsed,
      isLive,
      source,
    };

    return NextResponse.json({
      articles: sorted,
      fallbackUsed,
      isLive,
      source,
      lastUpdated,
      debugInfo,
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
      debugInfo: { error: String(err) },
    });
  }
}

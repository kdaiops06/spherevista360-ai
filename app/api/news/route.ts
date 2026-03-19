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

    // STEP 1: LOG FULL RESPONSE STRUCTURE
    console.log("FULL NEWS RESULT:", JSON.stringify(newsResult, null, 2));


    // STEP 3: FIX RAW ASSIGNMENT (try all common patterns, but only if data is object)
    if (newsResult.data && typeof newsResult.data === 'object' && !Array.isArray(newsResult.data)) {
      const dataObj = newsResult.data as Record<string, unknown>;
      if (Array.isArray((dataObj as any).articles)) {
        raw = (dataObj as any).articles;
      } else if (Array.isArray((dataObj as any).items)) {
        raw = (dataObj as any).items;
      } else if (Array.isArray((dataObj as any).results)) {
        raw = (dataObj as any).results;
      } else {
        raw = newsResult.data;
      }
    } else if (Array.isArray(newsResult.data)) {
      raw = newsResult.data;
    } else if (Array.isArray((newsResult as any).articles)) {
      raw = (newsResult as any).articles;
    } else {
      raw = [];
    }

    // STEP 4: SAFE NORMALIZATION
    if (Array.isArray(raw)) {
      console.log("RAW IS ARRAY, LENGTH:", raw.length);
    } else {
      console.log("RAW TYPE:", typeof raw);
    }

    const normalized = Array.isArray(raw)
      ? raw.map((item: any) => ({
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

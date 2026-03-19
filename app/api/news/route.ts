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

    // Extract articles array from possible locations
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

    // Normalize
    const normalized = Array.isArray(raw)
      ? raw.map((item: any) => ({
          title: item.title || item.headline || "No title",
          url: item.url || item.link || "#",
          source: item.source?.name || item.source || "Unknown",
          publishedAt:
            item.publishedAt || item.pubDate || item.date || new Date().toISOString(),
        }))
      : [];

    // Sort
    const sorted = normalized.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Fallback logic
    if (!sorted.length) {
      fallbackUsed = true;
    }

    return NextResponse.json({
      articles: sorted,
      fallbackUsed,
      isLive,
      source,
      lastUpdated,
    });
  } catch (err) {
    fallbackUsed = true;
    return NextResponse.json({
      articles: [],
      fallbackUsed: true,
      isLive: false,
      source: "Error",
      lastUpdated: null,
    });
  }
}

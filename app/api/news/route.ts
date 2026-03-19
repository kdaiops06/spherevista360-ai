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

    // STEP 3: FIX RAW ASSIGNMENT (try all common patterns)
    raw = newsResult.data?.articles || newsResult.data?.items || newsResult.data?.results || newsResult.data || newsResult.articles || [];

    // STEP 4: TEMPORARY DIRECT TEST
    if (Array.isArray(raw)) {
      console.log("RAW IS ARRAY, LENGTH:", raw.length);
    } else {
      console.log("RAW TYPE:", typeof raw);
    }

    // STEP 5: BYPASS NORMALIZATION (TEMP TEST)
    return NextResponse.json({
      rawPreview: raw?.slice?.(0, 3) || raw,
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

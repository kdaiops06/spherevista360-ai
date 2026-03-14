import { NextRequest, NextResponse } from "next/server";
import { convertFree } from "@/lib/free-currency-api";
import { convertCurrency } from "@/lib/data-sources";

// Static fallback rates (USD-based) — last updated March 2025
// Used only when both free API and paid API are unavailable
const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1, EUR: 0.9234, GBP: 0.7891, JPY: 149.85, CHF: 0.8812,
  AUD: 1.5423, CAD: 1.3567, NZD: 1.6812, CNY: 7.2341, INR: 83.42,
  SGD: 1.3412, HKD: 7.8102, KRW: 1325.50, BRL: 4.9730, MXN: 17.15, ZAR: 18.92,
  SEK: 10.45, NOK: 10.62, DKK: 6.88, PLN: 3.98, CZK: 22.85,
  HUF: 355.20, RON: 4.59, TRY: 32.10, RUB: 91.50, THB: 35.12,
  MYR: 4.72, IDR: 15680, PHP: 56.20, VND: 24850, TWD: 31.85,
  AED: 3.6725, SAR: 3.75, QAR: 3.64, KWD: 0.3077, BHD: 0.376,
  OMR: 0.385, ILS: 3.68, EGP: 30.90, NGN: 1550, KES: 153.50,
  GHS: 12.80, PKR: 278.50, BDT: 110.20, LKR: 312.50, NPR: 133.50,
  CLP: 925, COP: 3920, PEN: 3.72, ARS: 870, UYU: 39.20,
};
const FALLBACK_DATE = "2025-03-01";

function fallbackConvert(from: string, to: string, amount: number) {
  const fromRate = FALLBACK_USD_RATES[from];
  const toRate = FALLBACK_USD_RATES[to];
  if (fromRate === undefined || toRate === undefined) return null;
  const rate = toRate / fromRate;
  return {
    result: Math.round(amount * rate * 100) / 100,
    rate: Math.round(rate * 10000) / 10000,
    isLive: false,
    source: "Static fallback (rates may be outdated)",
    lastUpdated: FALLBACK_DATE,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const amountStr = searchParams.get("amount");

  if (!from || !to || !amountStr) {
    return NextResponse.json(
      { error: "Missing required parameters: from, to, amount" },
      { status: 400 }
    );
  }

  // Validate currency codes (3 uppercase letters)
  const currencyPattern = /^[A-Z]{3}$/;
  if (!currencyPattern.test(from) || !currencyPattern.test(to)) {
    return NextResponse.json(
      { error: "Invalid currency code format" },
      { status: 400 }
    );
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount < 0 || amount > 1_000_000_000) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  // Chain: Free API (frankfurter.app) → Paid API → Static fallback
  // 1) Try free ECB-based API (no key needed)
  try {
    const data = await convertFree(from, to, amount);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    // free API failed — try paid API next
  }

  // 2) Try paid ExchangeRate API (if key configured)
  try {
    const data = await convertCurrency(from, to, amount);
    return NextResponse.json(
      { ...data, isLive: true, source: "ExchangeRate API", lastUpdated: new Date().toISOString().split("T")[0] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    // paid API failed or not configured — use static fallback
  }

  // 3) Static fallback (clearly labeled as outdated)
  const fallback = fallbackConvert(from, to, amount);
  if (fallback) {
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  return NextResponse.json(
    { error: "Currency pair not supported" },
    { status: 502 }
  );
}

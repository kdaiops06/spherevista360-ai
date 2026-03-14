import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/data-sources";

// Fallback rates (USD-based) for when API key is not configured
const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1, EUR: 0.9234, GBP: 0.7891, JPY: 149.85, CHF: 0.8812,
  AUD: 1.5423, CAD: 1.3567, NZD: 1.6812, CNY: 7.2341, INR: 83.42,
  SGD: 1.3412, HKD: 7.8102, KRW: 1325.50, BRL: 4.9730, MXN: 17.15, ZAR: 18.92,
};

function fallbackConvert(from: string, to: string, amount: number) {
  const fromRate = FALLBACK_USD_RATES[from];
  const toRate = FALLBACK_USD_RATES[to];
  if (fromRate === undefined || toRate === undefined) return null;
  const rate = toRate / fromRate;
  return { result: Math.round(amount * rate * 100) / 100, rate: Math.round(rate * 10000) / 10000 };
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

  try {
    const data = await convertCurrency(from, to, amount);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    // Fallback to hardcoded rates
    const fallback = fallbackConvert(from, to, amount);
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch exchange rate. Configure EXCHANGERATE_API_KEY for full coverage." },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { convertCurrency } from "@/lib/data-sources";
import { convertFree } from "@/lib/free-currency-api";

export const revalidate = 300;

const querySchema = z.object({
  from: z.string().trim().toUpperCase().length(3),
  to: z.string().trim().toUpperCase().length(3),
  amount: z.coerce.number().positive().max(1_000_000_000),
});

const STATIC_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.9234,
  GBP: 0.7891,
  JPY: 149.85,
  CHF: 0.8812,
  AUD: 1.5423,
  CAD: 1.3567,
  NZD: 1.6812,
  CNY: 7.2341,
  INR: 83.42,
  SGD: 1.3412,
  HKD: 7.8102,
  KRW: 1331.5,
  BRL: 5.08,
  MXN: 16.94,
  ZAR: 18.41,
};

function convertWithStaticRates(from: string, to: string, amount: number) {
  const fromRate = STATIC_USD_RATES[from];
  const toRate = STATIC_USD_RATES[to];

  if (!fromRate || !toRate) {
    return null;
  }

  const usdAmount = amount / fromRate;
  const result = usdAmount * toRate;
  const rate = toRate / fromRate;

  return {
    result: Math.round(result * 100) / 100,
    rate: Math.round(rate * 1_000_000) / 1_000_000,
    source: "Reference rates",
    lastUpdated: "2025-01-15T00:00:00Z",
    isLive: false,
  };
}

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid currency conversion request" },
      { status: 400 }
    );
  }

  const { from, to, amount } = parsed.data;

  if (from === to) {
    return NextResponse.json({
      result: amount,
      rate: 1,
      source: "Identity conversion",
      lastUpdated: new Date().toISOString(),
      isLive: true,
    });
  }

  try {
    const freeResult = await convertFree(from, to, amount);
    return NextResponse.json(freeResult);
  } catch {
    // Fall through to paid and reference sources.
  }

  if (process.env.EXCHANGERATE_API_KEY) {
    try {
      const paidResult = await convertCurrency(from, to, amount);
      return NextResponse.json({
        ...paidResult,
        source: "ExchangeRate API",
        lastUpdated: new Date().toISOString(),
        isLive: true,
      });
    } catch {
      // Fall through to static reference rates.
    }
  }

  const staticResult = convertWithStaticRates(from, to, amount);
  if (staticResult) {
    return NextResponse.json(staticResult);
  }

  return NextResponse.json(
    { error: `Unsupported currency pair: ${from}/${to}` },
    { status: 400 }
  );
}

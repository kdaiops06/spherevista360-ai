import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/data-sources";

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
    return NextResponse.json(
      { error: "Failed to fetch exchange rate" },
      { status: 502 }
    );
  }
}

import type { CurrencyRate } from "@/types";

// ─── Free Currency API (no key required) ─────────────────────────
// Uses frankfurter.app — based on European Central Bank (ECB) data
// Free, open-source, no rate limits, no API key needed
// Rates are updated daily around 16:00 CET by the ECB

const FRANKFURTER_BASE = "https://api.frankfurter.app";

export interface FreeRateResult {
  rates: CurrencyRate[];
  source: string;
  lastUpdated: string;
  isLive: boolean;
}

export interface FreeConvertResult {
  result: number;
  rate: number;
  source: string;
  lastUpdated: string;
  isLive: boolean;
}

/**
 * Fetch latest exchange rates from frankfurter.app (ECB data, free, no key).
 * Returns rates for all available currencies relative to the base.
 */
export async function fetchFreeRates(base: string = "USD"): Promise<FreeRateResult> {
  const url = `${FRANKFURTER_BASE}/latest?base=${encodeURIComponent(base)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`frankfurter.app error: ${res.status}`);
  }

  const data = await res.json();
  // data = { amount: 1, base: "USD", date: "2026-03-14", rates: { EUR: 0.92, ... } }

  const rates: CurrencyRate[] = Object.entries(data.rates).map(([currency, rate]) => ({
    base: data.base,
    target: currency,
    rate: rate as number,
    lastUpdated: data.date,
  }));

  return {
    rates,
    source: "European Central Bank",
    lastUpdated: data.date,
    isLive: true,
  };
}

/**
 * Convert currency using frankfurter.app (free, no key).
 */
export async function convertFree(
  from: string,
  to: string,
  amount: number
): Promise<FreeConvertResult> {
  const url = `${FRANKFURTER_BASE}/latest?amount=${amount}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`frankfurter.app conversion error: ${res.status}`);
  }

  const data = await res.json();
  // data = { amount: 100, base: "USD", date: "2026-03-14", rates: { INR: 8342.0 } }

  const convertedAmount = data.rates[to];
  const rate = convertedAmount / data.amount;

  return {
    result: Math.round(convertedAmount * 100) / 100,
    rate: Math.round(rate * 10000) / 10000,
    source: "European Central Bank",
    lastUpdated: data.date,
    isLive: true,
  };
}

/**
 * Fetch historical rates for a specific date.
 */
export async function fetchHistoricalRates(
  date: string,
  base: string = "USD"
): Promise<FreeRateResult> {
  const url = `${FRANKFURTER_BASE}/${date}?base=${encodeURIComponent(base)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) {
    throw new Error(`frankfurter.app historical error: ${res.status}`);
  }

  const data = await res.json();

  const rates: CurrencyRate[] = Object.entries(data.rates).map(([currency, rate]) => ({
    base: data.base,
    target: currency,
    rate: rate as number,
    lastUpdated: data.date,
  }));

  return {
    rates,
    source: "European Central Bank",
    lastUpdated: data.date,
    isLive: true,
  };
}

/**
 * Get list of currencies supported by the free API.
 * Returns ~33 major currencies (ECB-supported).
 */
export async function getFreeCurrencies(): Promise<Record<string, string>> {
  const res = await fetch(`${FRANKFURTER_BASE}/currencies`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to fetch currency list");
  return res.json();
}

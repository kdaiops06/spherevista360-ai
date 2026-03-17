// Safe calculation for percentage change (V2, non-breaking)
export function calculatePercentageChangeV2(current: unknown, previous: unknown): number | null {
  const curr = Number(String(current).trim());
  const prev = Number(String(previous).trim());
  if (
    curr === null ||
    curr === undefined ||
    prev === null ||
    prev === undefined ||
    isNaN(curr) ||
    isNaN(prev) ||
    prev === 0
  ) {
    return null;
  }
  return ((curr - prev) / prev) * 100;
}

// Safe calculation for absolute change (V2, non-breaking)
export function calculateAbsoluteChangeV2(current: unknown, previous: unknown): number | null {
  const curr = Number(String(current).trim());
  const prev = Number(String(previous).trim());
  if (isNaN(curr) || isNaN(prev)) return null;
  return curr - prev;
}
// Safe calculation for percentage change
export function calculatePercentageChange(current: unknown, previous: unknown): number | null {
  const curr = Number(current);
  const prev = Number(previous);
  if (prev === 0 || isNaN(curr) || isNaN(prev) || prev === null || prev === undefined || curr === null || curr === undefined) {
    return null;
  }
  return ((curr - prev) / prev) * 100;
}

// Safe calculation for absolute change
export function calculateAbsoluteChange(current: unknown, previous: unknown): number | null {
  const curr = Number(current);
  const prev = Number(previous);
  if (isNaN(curr) || isNaN(prev) || prev === null || prev === undefined || curr === null || curr === undefined) {
    return null;
  }
  return curr - prev;
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export const SITE_CONFIG = {
  name: "SphereVista360",
  description:
    "AI-Powered Financial Intelligence & Analytics Platform",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://spherevista360.com",
  locale: "en_US",
  twitter: "@spherevista360",
};

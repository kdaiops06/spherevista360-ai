# Contributing to SphereVista360

Thank you for wanting to contribute to SphereVista360! This guide covers how to add new features, tools, and content to the platform.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a Financial Tool](#adding-a-financial-tool)
- [Adding an AI Agent](#adding-an-ai-agent)
- [Adding Programmatic Pages](#adding-programmatic-pages)
- [Adding E2E Tests](#adding-e2e-tests)
- [Code Guidelines](#code-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/spherevista360-ai.git
cd spherevista360-ai

# 3. Install dependencies
npm install
npx playwright install --with-deps chromium

# 4. Set up environment
cp .env.example .env.local
# API keys are optional — demo data works out of the box

# 5. Start dev server
npm run dev

# 6. Run tests to verify setup
npm run test:e2e
```

---

## Development Workflow

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Run tests: `npm run test:e2e`
4. Run lint: `npm run lint`
5. Commit with descriptive message
6. Push and open a PR against `main`

---

## Adding a Financial Tool

Financial tools are the highest-value pages for SEO and monetization. Each tool needs 3 things:

### Step 1: Create the Component

```typescript
// components/tools/MortgageCalculator.tsx
"use client";

import { useState } from "react";

export function MortgageCalculator() {
  const [principal, setPrincipal] = useState("300000");
  const [rate, setRate] = useState("7.5");
  const [years, setYears] = useState("20");

  const monthlyPayment = (() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (!p || !r || !n) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();

  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Mortgage Calculator
      </h2>
      {/* Input fields for principal, rate, years */}
      {/* Display monthlyPayment result */}
    </div>
  );
}
```

**Key rules:**
- Use `"use client"` — all tools are client-side interactive components
- Use `useState` with string values for inputs (avoids NaN on empty fields)
- Use the `card` CSS class for consistent styling
- Add proper number formatting with `Intl.NumberFormat`

### Step 2: Create the Page

```typescript
// app/tools/mortgage-calculator/page.tsx
import type { Metadata } from "next";
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";

export const metadata: Metadata = {
  title: "Mortgage Calculator — Calculate Monthly EMI | SphereVista360",
  description:
    "Free mortgage calculator to estimate monthly payments, total interest, and amortization. Compare rates across loan terms.",
};

export default function MortgageCalculatorPage() {
  return (
    <div className="container-main py-12">
      <MortgageCalculator />
      {/* JSON-LD WebApplication schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Mortgage Calculator",
            description: "Calculate monthly mortgage payments",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}
```

### Step 3: Add to Tools Index

Update `app/tools/page.tsx` — add your tool to the tools array.

### Step 4: Add an E2E Test

```typescript
// Add to e2e/tools.spec.ts
test("mortgage calculator page loads", async ({ page }) => {
  await page.goto("/tools/mortgage-calculator");
  await expect(page).toHaveTitle(/Mortgage/i);
  const inputs = page.locator('input[type="number"]');
  await expect(inputs.first()).toBeVisible();
});
```

---

## Adding an AI Agent

Agents are modular TypeScript modules that fetch data and generate AI-powered analysis.

### Step 1: Create the Agent

```typescript
// agents/crypto-agent.ts
import { generateWithClaude } from "@/lib/ai/client";

const SYSTEM_PROMPT = `You are a cryptocurrency market analyst. Provide data-driven analysis with specific numbers and actionable insights.`;

export async function fetchCryptoData() {
  // Fetch from CoinGecko, Binance, or other crypto APIs
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
  return res.json();
}

export async function generateCryptoArticle(data: Record<string, { usd: number }>) {
  const prompt = `Write a market analysis article about today's cryptocurrency prices: ${JSON.stringify(data)}`;
  return generateWithClaude(SYSTEM_PROMPT, prompt);
}

export const cryptoAgent = {
  name: "crypto-agent",
  description: "Cryptocurrency market analysis and article generation",
  fetchCryptoData,
  generateCryptoArticle,
};
```

### Step 2: Export from Index

```typescript
// agents/index.ts — add this line:
export { cryptoAgent } from "./crypto-agent";
```

### Step 3: Add to Generate Script

Add your agent to `scripts/generate-article.ts` in the generators array.

---

## Adding Programmatic Pages

Programmatic pages are the backbone of the SEO strategy. Here's how to add a new page type.

### Example: Tax Bracket Pages for 20 Countries

#### Step 1: Create the Data File

```typescript
// lib/tax-data.ts
export interface TaxBracket {
  slug: string;
  country: string;
  countryCode: string;
  topRate: number;
  brackets: number;
  gstRate: number;
}

export const TAX_DATA: TaxBracket[] = [
  {
    slug: "india-income-tax-brackets",
    country: "India",
    countryCode: "IN",
    topRate: 30,
    brackets: 5,
    gstRate: 18,
  },
  // ... 19 more countries
];

export function getTaxBySlug(slug: string) {
  return TAX_DATA.find((t) => t.slug === slug);
}
```

#### Step 2: Create the Dynamic Route

```typescript
// app/tax/[slug]/page.tsx
import { TAX_DATA, getTaxBySlug } from "@/lib/tax-data";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return TAX_DATA.map((t) => ({ slug: t.slug }));
}

export const revalidate = 86400; // ISR: 24 hours

export default async function TaxPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getTaxBySlug(slug);
  if (!data) notFound();

  return (
    <div className="container-main py-12">
      <h1>{data.country} Income Tax Brackets</h1>
      {/* Page content with JSON-LD schema */}
    </div>
  );
}
```

#### Step 3: Add Tests

```typescript
// e2e/programmatic-pages.spec.ts — add:
test("India tax bracket page loads", async ({ page }) => {
  await page.goto("/tax/india-income-tax-brackets");
  await expect(page).toHaveTitle(/India.*Tax/i);
});
```

---

## Adding E2E Tests

All E2E tests live in the `e2e/` directory and use Playwright.

### Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("page loads correctly", async ({ page }) => {
    await page.goto("/route");
    await expect(page).toHaveTitle(/Expected Title/i);
    await expect(
      page.getByRole("heading", { name: /heading text/i }).first()
    ).toBeVisible();
  });
});
```

### Tips

- Use `.first()` when `getByText()` might match multiple elements
- Use `getByRole("heading", { name: /text/i })` for headings
- Use `page.locator('input[type="number"]')` for form inputs
- API tests use `page.request.get()` / `page.request.post()`

### Run Tests

```bash
npm run test:e2e           # Headless
npm run test:e2e:ui        # Interactive UI
npm run test:e2e:headed    # Visible browser
```

---

## Code Guidelines

### File Naming

- Pages: `app/feature/page.tsx`
- Components: `components/category/ComponentName.tsx` (PascalCase)
- Libraries: `lib/feature-name.ts` (kebab-case)
- Agents: `agents/name-agent.ts`
- Tests: `e2e/feature.spec.ts`

### Component Patterns

- **Server components** (default): Pages, layouts, data-heavy components
- **Client components** (`"use client"`): Interactive tools, forms, charts
- **Import aliases**: Use `@/` for imports (`@/components/...`, `@/lib/...`)

### SEO Requirements

Every new page should include:
- `export const metadata: Metadata` with unique `title` and `description`
- JSON-LD structured data (FAQPage for content, WebApplication for tools)
- Internal links to related pages
- `revalidate` for ISR on dynamic pages

### Styling

- Use TailwindCSS utility classes
- Use `card` class for card containers
- Use `container-main` for page containers
- Use `prose` class for long-form content

---

## Pull Request Process

1. **Branch naming**: `feat/`, `fix/`, `docs/`, `test/` prefix
2. **Describe what you changed** and why
3. **Include screenshots** for UI changes
4. **All E2E tests must pass** — CI runs automatically
5. **One feature per PR** — keep PRs focused

### Good First Issues

Looking for something to work on? These are great starting points:

- **Add a new calculator tool** (debt payoff, FIRE calculator, tax calculator)
- **Add a new country** to `lib/inflation-data.ts` (with inflation rate data)
- **Add a new comparison pair** to `lib/comparisons.ts` (e.g., real-estate-vs-stocks)
- **Add a new investment guide** to `lib/investment-data.ts`
- **Improve test coverage** for edge cases
- **Improve accessibility** (aria labels, keyboard navigation)

---

## Questions?

Open a [Discussion](https://github.com/kdaiops06/spherevista360-ai/discussions) or [Issue](https://github.com/kdaiops06/spherevista360-ai/issues).

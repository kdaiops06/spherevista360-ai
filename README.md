# SphereVista360 — AI-Powered Financial Intelligence Platform

![SphereVista360](https://img.shields.io/badge/SphereVista360-Financial%20Intelligence-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A fully automated finance news and analytics platform capable of generating passive income through ads, affiliate content, financial tools, and SEO traffic. Built with Next.js 15, AI agents, and GitHub Actions automation.

**Live Site:** [https://spherevista360.com](https://spherevista360.com)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [AI Agents](#ai-agents)
- [Automation Pipeline](#automation-pipeline)
- [Financial Tools](#financial-tools)
- [Adding New Content Pipelines](#adding-new-content-pipelines)
- [Adding New Financial Tools](#adding-new-financial-tools)
- [Running Automation Locally](#running-automation-locally)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Monetization](#monetization)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    DATA SOURCES                          │
│  Alpha Vantage │ ExchangeRate │ FRED │ News API │ Reddit │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                    AI AGENTS                             │
│  news-agent │ currency-agent │ macro-agent │ seo-agent  │
│         prediction-agent                                │
│  Powered by: Claude API + OpenAI API                    │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│               AUTOMATION SCRIPTS                         │
│  fetch-news.ts → generate-article.ts → publish-post.ts  │
│  Orchestrated by: GitHub Actions (daily cron)           │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                    CONTENT LAYER                         │
│  MDX Articles │ Supabase (PostgreSQL) │ JSON Cache      │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                 NEXT.JS 15 FRONTEND                      │
│  Dashboard │ News │ Currencies │ Predictions │ Tools    │
│  SEO │ Structured Data │ AdSense │ Affiliates           │
│  Hosted on: Vercel (auto-deploy on push)                │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS, MDX |
| **Backend / Data** | Supabase, PostgreSQL |
| **AI** | Claude API (Anthropic), OpenAI API |
| **Automation** | GitHub Actions, cron jobs |
| **Hosting** | Vercel (auto-deploy) |
| **Data APIs** | Alpha Vantage, ExchangeRate API, FRED API, News API, Reddit API |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- API keys (see [Environment Variables](#environment-variables))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/spherevista360-ai.git
cd spherevista360-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

---

## Project Structure

```
spherevista360-ai/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with header/footer
│   ├── page.tsx                 # Homepage with dashboard
│   ├── news/                    # Financial news pages
│   │   ├── page.tsx            # News listing
│   │   └── [slug]/page.tsx     # Individual article
│   ├── currencies/              # Currency exchange rates
│   ├── predictions/             # AI market predictions
│   ├── tools/                   # Financial calculators
│   │   ├── currency-converter/
│   │   ├── inflation-calculator/
│   │   ├── compound-interest/
│   │   └── purchasing-power/
│   ├── dashboard/               # Full dashboard view
│   └── api/                     # API routes
│       ├── convert/             # Currency conversion endpoint
│       └── subscribe/           # Newsletter subscription
│
├── agents/                      # AI Agent modules
│   ├── index.ts                # Agent exports
│   ├── news-agent.ts           # Financial news agent
│   ├── currency-agent.ts       # Currency analysis agent
│   ├── macro-agent.ts          # Macroeconomic analysis agent
│   ├── prediction-agent.ts     # Market prediction agent
│   └── seo-agent.ts            # SEO optimization agent
│
├── scripts/                     # Automation scripts
│   ├── fetch-news.ts           # Fetch news from APIs
│   ├── generate-article.ts     # Generate articles with AI
│   └── publish-post.ts         # Commit & push to GitHub
│
├── components/                  # React components
│   ├── layout/                 # Header, Footer
│   ├── dashboard/              # Dashboard widgets
│   ├── tools/                  # Financial calculator components
│   ├── monetization/           # Ad, affiliate, newsletter components
│   └── seo/                    # SEO components
│
├── content/                     # MDX article content
│   ├── finance/                # Finance articles
│   ├── macro/                  # Macroeconomic articles
│   └── currencies/             # Currency articles
│
├── lib/                         # Utility libraries
│   ├── utils.ts                # General utilities
│   ├── content.ts              # MDX content pipeline
│   ├── data-sources.ts         # External API clients
│   ├── ai/client.ts            # AI API clients
│   └── supabase/               # Supabase client & schema
│
├── types/                       # TypeScript type definitions
├── .github/workflows/           # GitHub Actions
│   └── auto-publish.yml        # Daily auto-publish workflow
└── public/                      # Static assets
```

---

## AI Agents

### How Agents Work

Each agent is a modular TypeScript module that combines data fetching with AI-powered analysis:

| Agent | Purpose | Data Sources | AI Model |
|-------|---------|-------------|----------|
| `news-agent` | Fetch news, summarize, generate articles | News API, Reddit | Claude |
| `currency-agent` | Currency data analysis, forex articles | ExchangeRate API | Claude |
| `macro-agent` | Economic indicator analysis | FRED API | Claude |
| `prediction-agent` | Market outlook predictions | Alpha Vantage, FRED | Claude |
| `seo-agent` | SEO metadata, schema, internal links | Content analysis | Claude |

### Agent Architecture

```typescript
// Each agent exports a consistent interface:
export const newsAgent = {
  name: "news-agent",
  description: "Fetches financial news, summarizes, and generates SEO articles",
  fetchLatestNews,      // Data collection
  summarizeNews,        // AI summarization
  generateNewsArticle,  // AI article generation
};
```

### Using Agents Programmatically

```typescript
import { newsAgent, currencyAgent, seoAgent } from "./agents";

// Fetch and summarize news
const news = await newsAgent.fetchLatestNews();
const summary = await newsAgent.summarizeNews(news);

// Generate a currency article
const rates = await currencyAgent.fetchCurrencyData();
const article = await currencyAgent.generateCurrencyArticle(rates);

// Generate SEO metadata for content
const seo = await seoAgent.generateSEOMetadata(title, content, category);
```

---

## Automation Pipeline

### Daily Automated Publishing

The platform runs a daily GitHub Action that:

1. **Fetches** financial news from News API and Reddit
2. **Generates** 3 articles (finance, currency, macro) using AI
3. **Saves** articles as MDX files in the `content/` directory
4. **Commits** the new content to the repository
5. **Triggers** Vercel deployment automatically

### GitHub Action Schedule

The workflow runs daily at **6:00 AM UTC** and can also be triggered manually:

```yaml
on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:
    inputs:
      article_count:
        description: "Number of articles to generate"
        default: "3"
```

### Manual Trigger

You can trigger the workflow manually from the GitHub Actions tab or via the CLI:

```bash
gh workflow run auto-publish.yml -f article_count=5
```

---

## Financial Tools

### Available Tools

| Tool | URL | Description |
|------|-----|-------------|
| Currency Converter | `/tools/currency-converter` | Real-time conversion for 150+ currencies |
| Inflation Calculator | `/tools/inflation-calculator` | Calculate inflation impact over time |
| Compound Interest | `/tools/compound-interest` | Investment growth projections |
| Purchasing Power | `/tools/purchasing-power` | Compare USD value across years |

All tools are:
- **Client-side rendered** for instant interactivity
- **SEO optimized** with schema markup (WebApplication type)
- **Mobile responsive** with accessible form inputs

---

## Adding New Content Pipelines

### 1. Create a New Agent

```typescript
// agents/crypto-agent.ts
import { generateWithClaude } from "@/lib/ai/client";

const SYSTEM_PROMPT = `You are a crypto analyst...`;

export async function fetchCryptoData() {
  // Fetch from an API
}

export async function generateCryptoArticle(data: any) {
  const prompt = `Write an article about...`;
  const response = await generateWithClaude(SYSTEM_PROMPT, prompt);
  // Parse and return article
}

export const cryptoAgent = {
  name: "crypto-agent",
  fetchCryptoData,
  generateCryptoArticle,
};
```

### 2. Add to Generation Script

Edit `scripts/generate-article.ts` and add your agent to the generators array:

```typescript
import { cryptoAgent } from "../agents/crypto-agent";

const generators = [
  () => generateNewsArticle(newsItems),
  () => generateCurrencyArticle(),
  () => generateMacroArticle(),
  () => generateCryptoArticle(),  // Add new generator
];
```

### 3. Create Content Category

```bash
mkdir -p content/crypto
```

### 4. Add a Page Route

Create `app/crypto/page.tsx` to display the new content category.

---

## Adding New Financial Tools

### 1. Create the Component

```typescript
// components/tools/MortgageCalculator.tsx
"use client";

import { useState } from "react";

export function MortgageCalculator() {
  const [principal, setPrincipal] = useState("300000");
  // ... calculator logic
  return (
    <div className="card max-w-lg mx-auto">
      {/* Calculator UI */}
    </div>
  );
}
```

### 2. Create the Page

```typescript
// app/tools/mortgage-calculator/page.tsx
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";

export const metadata = {
  title: "Mortgage Calculator",
  description: "Calculate your monthly mortgage payments...",
};

export default function MortgageCalculatorPage() {
  return (
    <div className="container-main py-12">
      <MortgageCalculator />
      {/* Add schema markup */}
    </div>
  );
}
```

### 3. Add to Tools Index

Update `app/tools/page.tsx` to include the new tool in the grid.

---

## Running Automation Locally

### Full Pipeline

```bash
# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the complete pipeline
npm run auto-publish
```

### Individual Steps

```bash
# Step 1: Fetch news
npm run fetch-news

# Step 2: Generate articles (requires AI API keys)
npm run generate-article

# Step 3: Commit and push
npm run publish-post
```

### Custom Article Count

```bash
ARTICLES_COUNT=5 npm run generate-article
```

---

## Environment Variables

### Required for Full Functionality

| Variable | Description | Required For |
|----------|-------------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key | Article generation |
| `NEWS_API_KEY` | NewsAPI.org key | News fetching |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage key | Market data |
| `EXCHANGERATE_API_KEY` | ExchangeRate API key | Currency data |
| `FRED_API_KEY` | FRED API key | Economic indicators |

### Optional

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (alternative to Claude) |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | Reddit API for social data |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase database |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin operations |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense |

### Setting Up GitHub Secrets

For automated publishing, add your API keys as repository secrets:

```bash
gh secret set ANTHROPIC_API_KEY --body "your-key"
gh secret set NEWS_API_KEY --body "your-key"
gh secret set ALPHA_VANTAGE_API_KEY --body "your-key"
gh secret set EXCHANGERATE_API_KEY --body "your-key"
gh secret set FRED_API_KEY --body "your-key"
```

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Every push to `main` triggers automatic deployment
4. GitHub Actions auto-publish creates commits → triggers Vercel deploy

### Manual Build

```bash
npm run build
npm start
```

---

## Monetization

### Google AdSense

The `AdBanner` component is pre-built for AdSense integration:

```typescript
import { AdBanner } from "@/components/monetization/AdBanner";

// In any page or article
<AdBanner slot="your-ad-slot-id" format="auto" />
```

Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` in your environment variables.

### Affiliate Links

Use the `AffiliateSection` component:

```typescript
import { AffiliateSection } from "@/components/monetization/AffiliateSection";

<AffiliateSection
  links={[
    {
      name: "Trading Platform",
      description: "Commission-free stock trading",
      url: "https://example.com/ref/id",
      category: "Trading",
    },
  ]}
/>
```

### Newsletter

The `NewsletterSignup` component captures emails and stores them in Supabase.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built with ❤️ by [SphereVista360](https://spherevista360.com)

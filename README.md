# 🌐 SphereVista360 — AI-Powered Financial Intelligence Platform

<div align="center">

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://vercel.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**An open-source, fully automated finance platform generating 6,200+ SEO pages, AI-written articles, and passive revenue — all on autopilot.**

[Live Demo](https://spherevista360.com) · [Revenue Playbook](MONETIZATION.md) · [SEO Strategy](SEO-PLAYBOOK.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## Why SphereVista360?

Most finance websites are built manually — one article, one page at a time. SphereVista360 takes a different approach: **AI agents generate content, programmatic SEO creates thousands of pages, and GitHub Actions publish everything automatically.**

The result: a platform that grows organically while you sleep.

| What You Get | Scale |
|---|---|
| **Programmatic SEO pages** | 6,200+ (currency pairs, inflation, investments, comparisons) |
| **Financial calculator tools** | 11 interactive tools |
| **AI agents** | 6 agents for content, analysis, and SEO |
| **Automated publishing** | Daily via GitHub Actions cron |
| **E2E test coverage** | 36 Playwright tests + CI pipeline |
| **Revenue-ready components** | AdSense, affiliate, newsletter built-in |

---

## Platform at a Glance

```
📊 6,200+ SEO Pages → 📈 Organic Traffic → 💰 Multiple Revenue Streams

Currency Pairs (6,000+) ──┐
Inflation Trackers (30) ──┤
Investment Guides (30) ───┼── Google Indexation ─── AdSense ($15–$45 CPM)
Comparison Pages (20) ────┤                   ├── Affiliate ($50–$200/signup)
Financial Tools (11) ─────┤                   ├── Newsletter (2–5% conversion)
AI Articles (daily) ──────┘                   └── Sponsorships + API access
```

---

## Quick Start

```bash
git clone https://github.com/kdaiops06/spherevista360-ai.git
cd spherevista360-ai
npm install
cp .env.example .env.local   # Add your API keys
npm run dev                   # → http://localhost:3000
```

> **No API keys?** The platform works with demo/fallback data out of the box. Add keys later for live data.

---

## Architecture

```
DATA SOURCES                        AI AGENTS                    FRONTEND
─────────────                       ─────────                    ────────
Alpha Vantage ──┐                   news-agent ──┐
ExchangeRate ───┤                   currency-agent─┤              Dashboard
FRED API ───────┼─→ Automation ──→  macro-agent ───┼─→ Next.js → Tools (11)
News API ───────┤   Pipeline        prediction-agent│   15 App   Currency SEO
Reddit API ─────┘   (GitHub         seo-agent ─────┤   Router    Inflation
                     Actions)       content-agent──┘              Comparison
                                                                  Risk Radar
                        │
                        ▼
                   MDX Articles + Supabase + JSON Cache
                        │
                        ▼
                Vercel (auto-deploy on push)
```

---

## Pages & Routes

### Core Pages

| Route | Description |
|---|---|
| `/` | Homepage with dashboard widgets, risk radar, market overview |
| `/dashboard` | Full financial dashboard |
| `/news` | AI-generated financial news articles |
| `/predictions` | AI market predictions and outlooks |
| `/currencies` | Live currency exchange rates |
| `/global-risk-radar` | Composite risk index across 5 macro categories |
| `/tools` | Index of all 11 financial calculators |
| `/compare` | Asset comparison index (gold vs bitcoin, stocks vs bonds, etc.) |

### Financial Tools (11)

| Tool | Route | Keywords Targeted |
|---|---|---|
| Currency Converter | `/tools/currency-converter` | "currency converter", "USD to INR" |
| SIP Calculator | `/tools/sip-calculator` | "SIP calculator", "mutual fund SIP" |
| Compound Interest | `/tools/compound-interest` | "compound interest calculator" |
| EMI Calculator | `/tools/emi-calculator` | "EMI calculator", "loan EMI" |
| Inflation Calculator | `/tools/inflation-calculator` | "inflation calculator" |
| Purchasing Power | `/tools/purchasing-power` | "purchasing power calculator" |
| Investment Return | `/tools/investment-return` | "investment return calculator" |
| Gold vs Dollar | `/tools/gold-vs-dollar` | "gold price vs dollar" |
| Currency Strength | `/tools/currency-strength` | "currency strength index" |
| Recession Tracker | `/tools/recession-tracker` | "recession risk indicator" |
| Currency Crisis | `/tools/currency-crisis` | "currency crisis tracker" |

### Programmatic SEO Pages (6,200+)

| Type | Count | Route Pattern | Example |
|---|---|---|---|
| Currency pairs | 6,006 | `/usd-to-inr` | [/usd-to-inr](https://spherevista360.com/usd-to-inr) |
| Inflation trackers | 30 | `/inflation/[slug]` | [/inflation/india-inflation-rate](https://spherevista360.com/inflation/india-inflation-rate) |
| Investment guides | 30 | `/investment/[slug]` | [/investment/how-to-start-investing](https://spherevista360.com/investment/how-to-start-investing) |
| Asset comparisons | 20 | `/compare/[slug]` | [/compare/gold-vs-bitcoin](https://spherevista360.com/compare/gold-vs-bitcoin) |

---

## AI Agents

Six specialized AI agents power content generation and analysis:

| Agent | What It Does | Trigger |
|---|---|---|
| `news-agent` | Fetches financial news → summarizes → generates articles | Daily cron |
| `currency-agent` | Analyzes exchange rates → produces forex commentary | Daily cron |
| `macro-agent` | Processes GDP, CPI, employment data → economic analysis | Daily cron |
| `prediction-agent` | Combines data sources → market outlook predictions | Daily cron |
| `seo-agent` | Generates metadata, schema markup, internal links | On article creation |
| `content-agent` | Produces comparison articles, inflation reports, investment guides | On demand |

### Agent Usage

```typescript
import { newsAgent, currencyAgent, contentAgent } from "./agents";

// Daily pipeline (automated via GitHub Actions)
const news = await newsAgent.fetchLatestNews();
const article = await newsAgent.generateNewsArticle(news);

// On-demand content
const comparison = await contentAgent.generateComparisonArticle("gold", "bitcoin");
const inflationReport = await contentAgent.generateInflationArticle("India", "2026");
```

---

## Automation Pipeline

Daily GitHub Actions workflow generates and publishes content automatically:

```
6:00 AM UTC (daily)
       │
       ├─ 1. Fetch news from News API + Reddit
       ├─ 2. Generate 3 articles (finance, currency, macro) via AI
       ├─ 3. Save as MDX in content/ directory
       ├─ 4. Git commit + push to main
       └─ 5. Vercel auto-deploys new content
```

**Manual trigger:**
```bash
gh workflow run auto-publish.yml -f article_count=5
```

**Run locally:**
```bash
npm run auto-publish   # Full pipeline: fetch → generate → publish
npm run fetch-news     # Just fetch news
npm run generate-article   # Just generate articles
```

---

## Global Risk Radar

A composite risk dashboard tracking 5 macro risk categories, each scored 0–100:

| Category | Indicators |
|---|---|
| Recession Risk | GDP contraction probability, yield curve inversion |
| Inflation Risk | CPI deviation from central bank targets |
| Currency Crisis | Exchange rate volatility, reserve adequacy |
| Geopolitical Risk | Conflict indices, trade disruption signals |
| Debt Crisis | Sovereign debt levels, CDS spreads |

Available as a full page (`/global-risk-radar`) or compact homepage widget (`<GlobalRiskRadar compact />`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5.7 |
| Styling | TailwindCSS 3.4, @tailwindcss/typography |
| Database | Supabase (PostgreSQL) |
| AI | Claude API (Anthropic), OpenAI API |
| Charts | Recharts |
| Content | MDX with remark/rehype plugins |
| Testing | Playwright (36 E2E tests) |
| CI/CD | GitHub Actions (3 workflows) |
| Hosting | Vercel (auto-deploy) |
| Data APIs | Alpha Vantage, ExchangeRate, FRED, News API, Reddit |

---

## Testing

36 E2E tests covering all routes, tools, APIs, and programmatic pages:

```bash
npm run test:e2e          # Headless (CI)
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:headed   # Visible browser
```

| Test Suite | Tests | Covers |
|---|---|---|
| Homepage | 4 | Hero, dashboard cards, nav, risk radar |
| Tools | 12 | All 11 calculators + index |
| Currency pages | 6 | Pair pages, converter, reverse links, 404 |
| Risk Radar | 3 | Full page, 5 categories, methodology |
| API | 3 | Conversion endpoint, error handling |
| Programmatic pages | 6 | Comparisons, inflation, investment |

CI runs automatically on every push/PR via `.github/workflows/e2e-tests.yml`.

---

## Project Structure

```
spherevista360-ai/
├── app/                        # Next.js 15 App Router
│   ├── page.tsx               # Homepage (dashboard + risk radar)
│   ├── [pair]/                # 6,000+ currency pair pages
│   ├── compare/               # 20+ asset comparison pages
│   ├── inflation/             # 30 country inflation trackers
│   ├── investment/            # 30 investment guide pages
│   ├── global-risk-radar/     # Risk dashboard
│   ├── tools/                 # 11 financial calculators
│   ├── news/, predictions/    # AI-generated content
│   ├── dashboard/, currencies/
│   └── api/                   # convert, subscribe endpoints
├── agents/                    # 6 AI agents
├── components/
│   ├── dashboard/             # Dashboard widgets (6)
│   ├── tools/                 # Calculator components (11)
│   ├── monetization/          # AdBanner, Affiliate, Newsletter
│   ├── layout/                # Header, Footer
│   └── seo/                   # Currency pair converter
├── lib/                       # Data, API clients, utilities
│   ├── currency-pairs.ts      # 79 currencies → 6,006 pairs
│   ├── comparisons.ts         # 20 comparison definitions
│   ├── inflation-data.ts      # 30 countries
│   ├── investment-data.ts     # 30 guides
│   ├── ai/client.ts           # Claude/OpenAI client
│   └── supabase/              # Database client + schema
├── scripts/                   # Automation (fetch, generate, publish, SEO)
├── e2e/                       # 36 Playwright E2E tests
├── .github/workflows/         # 3 GitHub Actions workflows
├── content/                   # MDX articles
└── public/                    # Static assets
```

---

## Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI features | Claude API for article generation |
| `NEWS_API_KEY` | For news pipeline | News fetching (newsapi.org) |
| `ALPHA_VANTAGE_API_KEY` | For market data | Stock/forex data |
| `EXCHANGERATE_API_KEY` | For live rates | Currency conversion |
| `FRED_API_KEY` | For economic data | GDP, CPI, employment |
| `NEXT_PUBLIC_SUPABASE_URL` | For database | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For database | Supabase anonymous key |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | For ads | Google AdSense |

> **All variables are optional.** The platform falls back to demo data when keys are missing.

---

## Deployment

### Vercel (Recommended)

1. Fork this repo
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Every push to `main` auto-deploys

### Self-hosted

```bash
npm run build
npm start   # → http://localhost:3000
```

---

## Monetization

This platform is designed to generate revenue from day one. See the full **[Revenue & Monetization Playbook →](MONETIZATION.md)** for:

- 6 revenue streams with real math (ads, affiliates, newsletter, API, sponsorships, digital products)
- Traffic projections from 10K to 1M monthly pageviews
- Implementation roadmap (Phase 1–5)
- Operating cost breakdown ($50–$170/month)

**TL;DR revenue potential:**

| Monthly Traffic | Conservative Revenue |
|---|---|
| 50K pageviews | $850/month |
| 300K pageviews | $10,400/month |
| 1M pageviews | $53,000/month |

Built-in monetization components:
```typescript
<AdBanner slot="your-slot" format="auto" />          // Display ads
<AffiliateSection links={[...]} />                    // Affiliate links
<NewsletterSignup />                                   // Email capture
```

---

## SEO Strategy

See the full **[SEO Playbook →](SEO-PLAYBOOK.md)** for the technical breakdown of how 6,200+ pages are generated, indexed, and ranked.

Key strategies:
- **Programmatic page generation** — scripts create static params for every currency pair, country, and guide
- **JSON-LD schema markup** — FAQPage, WebApplication, and FinancialProduct schemas on every page
- **Internal linking mesh** — every page links to related pages (reverse pairs, same-category guides)
- **ISR (Incremental Static Regeneration)** — pages revalidate every 24 hours for fresh data
- **Automated content velocity** — daily AI articles compound organic keyword coverage

---

## Contributing

We welcome contributions! See **[CONTRIBUTING.md →](CONTRIBUTING.md)** for:

- How to add new financial tools
- How to add new AI agents
- How to add programmatic page types
- PR guidelines and code standards

**Good first contributions:**
- Add a new currency pair comparison page
- Add a new financial calculator tool
- Add a new country to inflation tracking
- Improve existing E2E test coverage

---

## Documentation

| Document | Description |
|---|---|
| [README.md](README.md) | This file — project overview and quick start |
| [MONETIZATION.md](MONETIZATION.md) | Revenue playbook with 6 streams and projections |
| [SEO-PLAYBOOK.md](SEO-PLAYBOOK.md) | Technical SEO strategy and programmatic page guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute: tools, agents, pages, tests |
| [LICENSE](LICENSE) | MIT License |

---

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, build on it. A star ⭐ is appreciated if you find this useful.

---

<div align="center">

**Built by [SphereVista360](https://spherevista360.com)**

If this project helped you, consider giving it a ⭐ — it helps others discover it.

[Report Bug](https://github.com/kdaiops06/spherevista360-ai/issues) · [Request Feature](https://github.com/kdaiops06/spherevista360-ai/issues) · [Discussions](https://github.com/kdaiops06/spherevista360-ai/discussions)

</div>

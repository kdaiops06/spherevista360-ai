// Comparison data for programmatic SEO pages under /compare/[slug]

export interface ComparisonPair {
  slug: string;
  asset1: string;
  asset2: string;
  title: string;
  description: string;
  category: string;
}

export const COMPARISONS: ComparisonPair[] = [
  // Precious metals vs currencies
  { slug: "gold-vs-dollar", asset1: "Gold", asset2: "US Dollar", title: "Gold vs Dollar: Which Protects Your Wealth Better?", description: "Compare gold and the US dollar as stores of value. Historical returns, inflation hedging, and portfolio allocation.", category: "precious-metals" },
  { slug: "gold-vs-bitcoin", asset1: "Gold", asset2: "Bitcoin", title: "Gold vs Bitcoin: Digital Gold or Real Gold?", description: "Compare gold and bitcoin as investments. Returns, volatility, inflation hedging, and which is better for your portfolio.", category: "precious-metals" },
  { slug: "silver-vs-gold", asset1: "Silver", asset2: "Gold", title: "Silver vs Gold: Which Precious Metal Should You Invest In?", description: "Compare silver and gold investments. Price ratios, historical returns, and industrial demand factors.", category: "precious-metals" },
  // Crypto comparisons
  { slug: "bitcoin-vs-ethereum", asset1: "Bitcoin", asset2: "Ethereum", title: "Bitcoin vs Ethereum: Complete Investment Comparison", description: "Compare Bitcoin and Ethereum. Technology, returns, use cases, and which cryptocurrency to invest in.", category: "crypto" },
  { slug: "bitcoin-vs-sp500", asset1: "Bitcoin", asset2: "S&P 500", title: "Bitcoin vs S&P 500: Historical Returns Compared", description: "Compare Bitcoin and S&P 500 index performance. Risk-adjusted returns, volatility, and portfolio impact.", category: "crypto" },
  // Stock market
  { slug: "stocks-vs-bonds", asset1: "Stocks", asset2: "Bonds", title: "Stocks vs Bonds: Building the Right Portfolio Mix", description: "Compare stocks and bonds. Returns, risk, income generation, and optimal allocation strategies.", category: "stocks" },
  { slug: "stocks-vs-real-estate", asset1: "Stocks", asset2: "Real Estate", title: "Stocks vs Real Estate: Which Investment Wins?", description: "Compare stock market and real estate investment. Long-term returns, liquidity, tax benefits, and entry barriers.", category: "stocks" },
  { slug: "index-funds-vs-mutual-funds", asset1: "Index Funds", asset2: "Mutual Funds", title: "Index Funds vs Mutual Funds: Cost, Performance & More", description: "Compare index funds and mutual funds. Fee structures, performance, active vs passive management.", category: "stocks" },
  { slug: "etf-vs-mutual-fund", asset1: "ETFs", asset2: "Mutual Funds", title: "ETFs vs Mutual Funds: Key Differences Explained", description: "Compare ETFs and mutual funds. Tax efficiency, trading flexibility, and expense ratios.", category: "stocks" },
  // Savings
  { slug: "fixed-deposit-vs-mutual-fund", asset1: "Fixed Deposits", asset2: "Mutual Funds", title: "Fixed Deposit vs Mutual Fund: Safety vs Returns", description: "Compare fixed deposits and mutual funds. Guaranteed returns vs market returns, risk, and liquidity.", category: "savings" },
  { slug: "ppf-vs-elss", asset1: "PPF", asset2: "ELSS", title: "PPF vs ELSS: Best Tax-Saving Investment?", description: "Compare PPF and ELSS for tax saving. Lock-in period, returns, risk level, and tax benefits under 80C.", category: "savings" },
  { slug: "sip-vs-lumpsum", asset1: "SIP", asset2: "Lump Sum", title: "SIP vs Lump Sum: Which Investment Strategy Works Better?", description: "Compare SIP and lump sum investing. Rupee cost averaging, timing risk, and historical performance.", category: "savings" },
  // Currency
  { slug: "dollar-vs-euro", asset1: "US Dollar", asset2: "Euro", title: "Dollar vs Euro: Reserve Currency Battle", description: "Compare USD and EUR. Purchasing power, trade volumes, central bank policy, and forex outlook.", category: "currency" },
  { slug: "dollar-vs-yuan", asset1: "US Dollar", asset2: "Chinese Yuan", title: "Dollar vs Yuan: The New Currency Rivalry", description: "Compare USD and CNY. Trade dominance, SWIFT share, de-dollarization trends, and geopolitical factors.", category: "currency" },
  { slug: "dollar-vs-rupee", asset1: "US Dollar", asset2: "Indian Rupee", title: "Dollar vs Rupee: Exchange Rate Trends & Outlook", description: "Compare USD and INR. Historical exchange rates, RBI policy, trade deficit impact, and forecasts.", category: "currency" },
  // Real assets
  { slug: "real-estate-vs-gold", asset1: "Real Estate", asset2: "Gold", title: "Real Estate vs Gold: Best Long-Term Investment?", description: "Compare real estate and gold investments. Capital appreciation, rental yield vs zero income, liquidity comparison.", category: "real-assets" },
  { slug: "commodities-vs-stocks", asset1: "Commodities", asset2: "Stocks", title: "Commodities vs Stocks: Diversification Benefits", description: "Compare commodity and stock investments. Inflation hedging, correlation, and portfolio diversification.", category: "commodities" },
  // Insurance/retirement
  { slug: "term-vs-whole-life", asset1: "Term Insurance", asset2: "Whole Life Insurance", title: "Term vs Whole Life Insurance: Which Should You Buy?", description: "Compare term and whole life insurance. Cost, coverage, cash value, and which policy type fits your needs.", category: "insurance" },
  { slug: "traditional-ira-vs-roth-ira", asset1: "Traditional IRA", asset2: "Roth IRA", title: "Traditional IRA vs Roth IRA: Tax Implications Compared", description: "Compare Traditional and Roth IRA retirement accounts. Tax treatment, withdrawal rules, and contribution limits.", category: "retirement" },
  { slug: "401k-vs-ira", asset1: "401(k)", asset2: "IRA", title: "401(k) vs IRA: Choosing the Right Retirement Account", description: "Compare 401(k) and IRA retirement accounts. Contribution limits, employer match, and tax advantages.", category: "retirement" },
];

export function getComparisonBySlug(slug: string): ComparisonPair | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getRelatedComparisons(slug: string, limit = 4): ComparisonPair[] {
  const current = getComparisonBySlug(slug);
  if (!current) return COMPARISONS.slice(0, limit);
  return COMPARISONS.filter(
    (c) => c.slug !== slug && c.category === current.category
  ).slice(0, limit);
}

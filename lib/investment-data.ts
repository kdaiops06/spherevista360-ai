// Investment guide data for programmatic SEO pages

export interface InvestmentGuide {
  slug: string;
  title: string;
  description: string;
  category: string;
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  minInvestment: string;
  timeHorizon: string;
}

export const INVESTMENT_GUIDES: InvestmentGuide[] = [
  // Beginner guides
  { slug: "how-to-start-investing", title: "How to Start Investing: Complete Beginner's Guide", description: "Step-by-step guide on how to start investing. Learn asset classes, brokerages, portfolios, and strategies for beginners.", category: "beginner", riskLevel: "Moderate", minInvestment: "$100", timeHorizon: "5+ years" },
  { slug: "what-is-compound-interest", title: "What Is Compound Interest and How Does It Work?", description: "Understand compound interest — the eighth wonder of the world. Learn how to make your money grow exponentially.", category: "beginner", riskLevel: "Low", minInvestment: "$1", timeHorizon: "1+ year" },
  { slug: "what-is-sip-investing", title: "What Is SIP Investing? Systematic Investment Plan Guide", description: "Complete guide to SIP investing. Learn how to invest monthly in mutual funds and build long-term wealth.", category: "beginner", riskLevel: "Moderate", minInvestment: "$50", timeHorizon: "3+ years" },
  { slug: "understanding-risk-and-return", title: "Understanding Risk and Return in Investing", description: "Learn the relationship between risk and return. How to measure, manage, and balance investment risk.", category: "beginner", riskLevel: "Moderate", minInvestment: "Any", timeHorizon: "Any" },
  { slug: "dollar-cost-averaging", title: "Dollar Cost Averaging: Strategy, Benefits, and Examples", description: "Learn dollar cost averaging (DCA) — a strategy to reduce timing risk by investing fixed amounts at regular intervals.", category: "beginner", riskLevel: "Low", minInvestment: "$50", timeHorizon: "1+ year" },
  // Stock market
  { slug: "how-to-invest-in-stocks", title: "How to Invest in Stocks: Step-by-Step Guide", description: "Learn how to invest in stocks. Stock selection, portfolio building, and long-term wealth creation strategies.", category: "stocks", riskLevel: "High", minInvestment: "$100", timeHorizon: "5+ years" },
  { slug: "index-fund-investing", title: "Index Fund Investing: The Smart Passive Strategy", description: "Why index funds beat most active managers. How to build a low-cost, diversified portfolio with index funds.", category: "stocks", riskLevel: "Moderate", minInvestment: "$100", timeHorizon: "5+ years" },
  { slug: "dividend-investing-strategy", title: "Dividend Investing: Build Passive Income from Stocks", description: "Learn dividend investing. How to select dividend stocks, build income, and compound returns over time.", category: "stocks", riskLevel: "Moderate", minInvestment: "$500", timeHorizon: "5+ years" },
  { slug: "value-investing-guide", title: "Value Investing: Warren Buffett's Approach Explained", description: "Learn value investing principles. How to find undervalued stocks and invest like Warren Buffett.", category: "stocks", riskLevel: "High", minInvestment: "$1,000", timeHorizon: "5+ years" },
  { slug: "growth-investing-guide", title: "Growth Investing: Finding High-Growth Companies", description: "Learn growth investing. How to identify companies with above-average revenue and earnings growth potential.", category: "stocks", riskLevel: "High", minInvestment: "$500", timeHorizon: "5+ years" },
  // Fixed income
  { slug: "how-to-invest-in-bonds", title: "How to Invest in Bonds: Fixed Income Guide", description: "Complete guide to bond investing. Government, corporate, and municipal bonds explained for beginners.", category: "fixed-income", riskLevel: "Low", minInvestment: "$1,000", timeHorizon: "1+ year" },
  { slug: "treasury-bonds-guide", title: "US Treasury Bonds: The Safest Investment Explained", description: "Learn about US Treasury bonds, notes, and bills. Yields, risks, and how to buy government securities.", category: "fixed-income", riskLevel: "Low", minInvestment: "$100", timeHorizon: "1+ year" },
  { slug: "fixed-deposit-investing", title: "Fixed Deposit Investing: Safety and Guaranteed Returns", description: "Complete guide to fixed deposits. Compare rates, understand lock-in periods, and maximize FD returns.", category: "fixed-income", riskLevel: "Low", minInvestment: "$500", timeHorizon: "1+ year" },
  // Real estate
  { slug: "real-estate-investing-beginners", title: "Real Estate Investing for Beginners", description: "How to start real estate investing. Rental properties, REITs, fix-and-flip, and real estate crowdfunding.", category: "real-estate", riskLevel: "Moderate", minInvestment: "$5,000", timeHorizon: "5+ years" },
  { slug: "reit-investing-guide", title: "REIT Investing: Earn Real Estate Income Without Property", description: "Learn REIT investing. How to earn real estate income through publicly traded and private REITs.", category: "real-estate", riskLevel: "Moderate", minInvestment: "$100", timeHorizon: "3+ years" },
  // Crypto
  { slug: "how-to-invest-in-bitcoin", title: "How to Invest in Bitcoin: Complete Guide", description: "Learn how to buy, store, and invest in Bitcoin. Exchanges, wallets, strategies, and risk management.", category: "crypto", riskLevel: "Very High", minInvestment: "$10", timeHorizon: "3+ years" },
  { slug: "how-to-invest-in-ethereum", title: "How to Invest in Ethereum: A Beginner's Guide", description: "Learn how to invest in Ethereum. DeFi, staking, smart contracts, and ETH investment strategies.", category: "crypto", riskLevel: "Very High", minInvestment: "$10", timeHorizon: "3+ years" },
  { slug: "cryptocurrency-portfolio-guide", title: "Building a Cryptocurrency Portfolio: Diversification Guide", description: "How to build a diversified crypto portfolio. Asset allocation, risk management, and rebalancing strategies.", category: "crypto", riskLevel: "Very High", minInvestment: "$100", timeHorizon: "3+ years" },
  // Gold & commodities
  { slug: "how-to-invest-in-gold", title: "How to Invest in Gold: Physical, ETFs, and Mining Stocks", description: "Complete gold investment guide. Physical gold, gold ETFs, mining stocks, and digital gold options compared.", category: "commodities", riskLevel: "Moderate", minInvestment: "$100", timeHorizon: "3+ years" },
  { slug: "silver-investing-guide", title: "Silver Investing Guide: Industrial Demand Meets Store of Value", description: "Learn to invest in silver. Physical silver, ETFs, mining stocks, and the gold-silver ratio strategy.", category: "commodities", riskLevel: "Moderate", minInvestment: "$100", timeHorizon: "3+ years" },
  // Retirement
  { slug: "retirement-planning-guide", title: "Retirement Planning: How Much Do You Need to Retire?", description: "Complete retirement planning guide. Calculate your retirement number, savings rate, and investment strategy.", category: "retirement", riskLevel: "Moderate", minInvestment: "$100/month", timeHorizon: "20+ years" },
  { slug: "401k-investing-guide", title: "401(k) Investing Guide: Maximize Your Employer Match", description: "How to optimize 401(k) investing. Contribution strategies, fund selection, and common mistakes to avoid.", category: "retirement", riskLevel: "Moderate", minInvestment: "Varies", timeHorizon: "20+ years" },
  { slug: "roth-ira-guide", title: "Roth IRA Complete Guide: Tax-Free Retirement Growth", description: "Everything about Roth IRA. Eligibility, contribution limits, withdrawal rules, and investment strategies.", category: "retirement", riskLevel: "Moderate", minInvestment: "$50", timeHorizon: "5+ years" },
  // Tax
  { slug: "tax-loss-harvesting", title: "Tax-Loss Harvesting: Reduce Your Tax Bill Through Investing", description: "Learn tax-loss harvesting. How to offset capital gains, reduce taxes, and improve after-tax returns.", category: "tax", riskLevel: "Low", minInvestment: "Any", timeHorizon: "Any" },
  { slug: "tax-saving-investments", title: "Tax Saving Investments: Reduce Your Tax Liability", description: "Best tax-saving investments. Section 80C, ELSS, PPF, NPS, and other tax-efficient investment options.", category: "tax", riskLevel: "Low", minInvestment: "$100", timeHorizon: "3+ years" },
  // Forex
  { slug: "forex-trading-beginners", title: "Forex Trading for Beginners: Currency Market Guide", description: "Learn forex trading basics. Currency pairs, pips, leverage, strategies, and risk management for new traders.", category: "forex", riskLevel: "Very High", minInvestment: "$100", timeHorizon: "Any" },
  { slug: "carry-trade-strategy", title: "Carry Trade Strategy: Profiting from Interest Rate Differentials", description: "Learn the carry trade strategy in forex. How interest rate differentials create profit opportunities.", category: "forex", riskLevel: "High", minInvestment: "$1,000", timeHorizon: "Months" },
  // Alternative investments
  { slug: "art-investing-guide", title: "Art Investing: How to Build an Art Portfolio", description: "Guide to art investing. Art funds, fractional ownership, and how art performs as an alternative asset.", category: "alternative", riskLevel: "High", minInvestment: "$500", timeHorizon: "5+ years" },
  { slug: "peer-to-peer-lending", title: "Peer-to-Peer Lending: Earn Returns as a Lender", description: "Learn P2P lending investing. Platforms, returns, risks, and how to diversify your lending portfolio.", category: "alternative", riskLevel: "High", minInvestment: "$25", timeHorizon: "1+ year" },
  { slug: "venture-capital-investing", title: "Venture Capital Investing: How to Invest in Startups", description: "Learn VC investing. Angel investing, venture funds, equity crowdfunding, and startup due diligence.", category: "alternative", riskLevel: "Very High", minInvestment: "$1,000", timeHorizon: "7+ years" },
];

export function getGuideBySlug(slug: string): InvestmentGuide | undefined {
  return INVESTMENT_GUIDES.find((g) => g.slug === slug);
}

export function getRelatedGuides(slug: string, limit = 4): InvestmentGuide[] {
  const current = getGuideBySlug(slug);
  if (!current) return INVESTMENT_GUIDES.slice(0, limit);
  return INVESTMENT_GUIDES.filter(
    (g) => g.slug !== slug && g.category === current.category
  ).slice(0, limit);
}

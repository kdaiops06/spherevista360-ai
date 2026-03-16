import type { MarketData, CurrencyRate, EconomicIndicator, NewsItem } from "@/types";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";
const EXCHANGERATE_BASE = "https://v6.exchangerate-api.com/v6";
const FRED_BASE = "https://api.stlouisfed.org/fred";
const NEWS_API_BASE = "https://newsapi.org/v2";

// ─── Alpha Vantage ───────────────────────────────────────────────

export async function fetchStockQuote(symbol: string): Promise<MarketData> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) throw new Error("ALPHA_VANTAGE_API_KEY not set");

  const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const quote = data["Global Quote"];

  if (!quote) throw new Error(`No data for symbol: ${symbol}`);

  return {
    symbol: quote["01. symbol"],
    name: quote["01. symbol"],
    price: parseFloat(quote["05. price"]),
    change: parseFloat(quote["09. change"]),
    changePercent: parseFloat(quote["10. change percent"]?.replace("%", "")),
    volume: parseInt(quote["06. volume"]),
    lastUpdated: quote["07. latest trading day"],
  };
}

export async function fetchTopGainersLosers(): Promise<{
  gainers: MarketData[];
  losers: MarketData[];
}> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) throw new Error("ALPHA_VANTAGE_API_KEY not set");

  const url = `${ALPHA_VANTAGE_BASE}?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  const mapItems = (items: Record<string, string>[]): MarketData[] =>
    (items || []).slice(0, 5).map((item) => ({
      symbol: item.ticker,
      name: item.ticker,
      price: parseFloat(item.price),
      change: parseFloat(item.change_amount),
      changePercent: parseFloat(item.change_percentage?.replace("%", "")),
      volume: parseInt(item.volume),
      lastUpdated: new Date().toISOString(),
    }));

  return {
    gainers: mapItems(data.top_gainers),
    losers: mapItems(data.top_losers),
  };
}

// ─── ExchangeRate API ────────────────────────────────────────────

export async function fetchExchangeRates(
  base: string = "USD"
): Promise<CurrencyRate[]> {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) throw new Error("EXCHANGERATE_API_KEY not set");

  const url = `${EXCHANGERATE_BASE}/${apiKey}/latest/${encodeURIComponent(base)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.result !== "success") {
    throw new Error(`Exchange rate API error: ${data["error-type"]}`);
  }

  return Object.entries(data.conversion_rates).map(([currency, rate]) => ({
    base,
    target: currency,
    rate: rate as number,
    lastUpdated: data.time_last_update_utc,
  }));
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number
): Promise<{ result: number; rate: number }> {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) throw new Error("EXCHANGERATE_API_KEY not set");

  const url = `${EXCHANGERATE_BASE}/${apiKey}/pair/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${amount}`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    result: data.conversion_result,
    rate: data.conversion_rate,
  };
}

// ─── FRED API ────────────────────────────────────────────────────

export async function fetchFredSeries(
  seriesId: string
): Promise<EconomicIndicator> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) throw new Error("FRED_API_KEY not set");

  const url = `${FRED_BASE}/series/observations?series_id=${encodeURIComponent(seriesId)}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
  const res = await fetch(url);
  const data = await res.json();

  const observations = data.observations || [];
  const latest = observations[0];
  const previous = observations[1];

  const seriesNames: Record<string, [string, string]> = {
    CPIAUCSL: ["CPI (All Urban Consumers)", "%"],
    UNRATE: ["Unemployment Rate", "%"],
    GDP: ["Gross Domestic Product", "Billions USD"],
    FEDFUNDS: ["Federal Funds Rate", "%"],
    DGS10: ["10-Year Treasury Rate", "%"],
    DGS2: ["2-Year Treasury Rate", "%"],
    T10Y2Y: ["10Y-2Y Treasury Spread", "%"],
    T10YIE: ["10-Year Breakeven Inflation", "%"],
  };

  const [name, unit] = seriesNames[seriesId] || [seriesId, ""];

  return {
    name,
    value: parseFloat(latest?.value || "0"),
    previousValue: parseFloat(previous?.value || "0"),
    unit,
    date: latest?.date || "",
    source: "FRED",
  };
}

export async function fetchKeyEconomicIndicators(): Promise<EconomicIndicator[]> {
  const seriesIds = ["CPIAUCSL", "UNRATE", "FEDFUNDS", "DGS10", "T10YIE"];
  const indicators = await Promise.all(seriesIds.map(fetchFredSeries));
  return indicators;
}

// ─── News API ────────────────────────────────────────────────────

export async function fetchFinanceNews(
  query: string = "finance economy markets"
): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error("NEWS_API_KEY not set");

  const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  return (data.articles || []).map(
    (a: Record<string, unknown>) => ({
      title: a.title as string,
      description: a.description as string,
      url: a.url as string,
      source: (a.source as Record<string, string>)?.name || "Unknown",
      publishedAt: a.publishedAt as string,
      category: "finance",
    })
  );
}

// ─── Reddit API ──────────────────────────────────────────────────

export async function fetchRedditPosts(
  subreddit: string = "finance"
): Promise<NewsItem[]> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Reddit API credentials not set");
  }

  // Get access token
  const authRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const authData = await authRes.json();

  const postsRes = await fetch(
    `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/hot?limit=10`,
    {
      headers: { Authorization: `Bearer ${authData.access_token}` },
    }
  );
  const postsData = await postsRes.json();

  return (postsData.data?.children || []).map(
    (child: Record<string, Record<string, unknown>>) => ({
      title: child.data.title as string,
      description: (child.data.selftext as string)?.slice(0, 200) || "",
      url: `https://reddit.com${child.data.permalink}`,
      source: `r/${subreddit}`,
      publishedAt: new Date(
        (child.data.created_utc as number) * 1000
      ).toISOString(),
      category: "social",
    })
  );
}

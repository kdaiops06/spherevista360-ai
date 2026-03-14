import type { Metadata } from "next";
import GlobalRiskRadar from "@/components/dashboard/GlobalRiskRadar";

export const metadata: Metadata = {
  title: "Global Risk Radar - Economic Risk Dashboard | SphereVista360",
  description:
    "Monitor global economic risk in real-time. Track recession probability, inflation risk, currency crises, geopolitical threats, and debt crisis indicators.",
  keywords: [
    "global risk radar",
    "recession probability",
    "economic risk",
    "inflation risk",
    "currency crisis",
    "geopolitical risk",
    "debt crisis",
    "financial risk dashboard",
  ],
};

export default function GlobalRiskRadarPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Global Risk Radar",
    description: metadata.description,
    url: "https://spherevista360.com/global-risk-radar",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-main py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Global Risk Radar</h1>
          <p className="mt-3 text-lg text-gray-600">
            Real-time composite risk assessment across 5 major economic
            categories. Updated daily using data from central banks, FRED, and
            market indicators.
          </p>
        </div>

        <GlobalRiskRadar />

        <div className="prose prose-indigo max-w-none mt-10">
          <h2>Understanding the Global Risk Score</h2>
          <p>
            The Global Risk Radar aggregates multiple economic indicators into a
            single composite risk score ranging from 0 to 100. A score below 40
            indicates low systemic risk, 40–59 indicates moderate risk, 60–74
            indicates high risk, and 75+ signals critical economic conditions.
          </p>

          <h2>How Risk Categories Are Computed</h2>

          <h3>Recession Risk</h3>
          <p>
            Tracks the US Treasury yield curve (2y–10y spread), manufacturing
            PMI, unemployment rate trends, and the Conference Board Leading
            Economic Index. Yield curve inversion has preceded every US
            recession since 1970.
          </p>

          <h3>Inflation Risk</h3>
          <p>
            Monitors Consumer Price Index (CPI) month-over-month changes,
            Producer Price Index (PPI), commodity prices (oil, food), and
            central bank policy rates. Persistent above-target inflation
            increases the risk score.
          </p>

          <h3>Currency Crisis Risk</h3>
          <p>
            Evaluates emerging market currencies based on foreign exchange
            reserves (import cover months), external debt-to-GDP ratios,
            current account balances, and inflation differentials. Countries
            with less than 3 months of import cover are flagged as high risk.
          </p>

          <h3>Geopolitical Risk</h3>
          <p>
            Assesses trade tensions, active sanctions, regional conflicts, and
            supply chain disruption risks. Uses news sentiment analysis and
            geopolitical event tracking.
          </p>

          <h3>Debt Crisis Risk</h3>
          <p>
            Analyzes sovereign debt-to-GDP ratios for major economies,
            corporate leverage (investment-grade vs high-yield spreads), and
            household debt levels. Rapid debt accumulation paired with rising
            interest rates increases this score.
          </p>
        </div>
      </div>
    </>
  );
}

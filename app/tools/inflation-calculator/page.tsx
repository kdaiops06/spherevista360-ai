import type { Metadata } from "next";
import { InflationCalculator } from "@/components/tools/InflationCalculator";

export const metadata: Metadata = {
  title: "Inflation Calculator - Measure Purchasing Power",
  description:
    "Calculate how inflation affects your money over time. See the real cost of inflation on your savings and purchasing power.",
};

export default function InflationCalculatorPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Inflation Calculator
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          See how inflation erodes your purchasing power over time
        </p>
      </div>

      <InflationCalculator />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>Understanding Inflation</h2>
        <p>
          Inflation is the rate at which the general level of prices for goods
          and services rises, causing purchasing power to fall. Central banks
          attempt to limit inflation and avoid deflation to keep the economy
          running smoothly.
        </p>
        <h3>Key Inflation Concepts</h3>
        <ul>
          <li><strong>CPI</strong> - Consumer Price Index measures average price changes</li>
          <li><strong>Core Inflation</strong> - Excludes volatile food and energy prices</li>
          <li><strong>Hyperinflation</strong> - Extremely rapid, out-of-control price increases</li>
          <li><strong>Deflation</strong> - A decrease in the general price level</li>
        </ul>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SphereVista360 Inflation Calculator",
            description: "Calculate how inflation affects your money over time",
            url: "https://spherevista360.com/tools/inflation-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}

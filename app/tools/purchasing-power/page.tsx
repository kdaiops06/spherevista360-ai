import type { Metadata } from "next";
import { PurchasingPowerCalculator } from "@/components/tools/PurchasingPowerCalculator";

export const metadata: Metadata = {
  title: "Purchasing Power Calculator - Dollar Value Over Time",
  description:
    "See how the purchasing power of the US dollar has changed over time. Compare the value of money across different years using CPI data.",
};

export default function PurchasingPowerPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Purchasing Power Calculator
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Compare the value of the US dollar across different years
        </p>
      </div>

      <PurchasingPowerCalculator />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>Understanding Purchasing Power</h2>
        <p>
          Purchasing power refers to the quantity of goods or services that one
          unit of money can buy. As inflation increases, purchasing power
          decreases. This calculator uses CPI data to show how the value of
          a dollar changes over time.
        </p>
        <h3>Historical Context</h3>
        <p>
          The US dollar has lost significant purchasing power over the decades.
          What cost $1 in 1990 would cost approximately $2.50 in 2026 due to
          cumulative inflation.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SphereVista360 Purchasing Power Calculator",
            description: "Compare purchasing power of the US dollar across years",
            url: "https://spherevista360.com/tools/purchasing-power",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}

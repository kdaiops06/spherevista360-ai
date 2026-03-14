import type { Metadata } from "next";
import { CurrencyCrisisTracker } from "@/components/tools/CurrencyCrisisTracker";

export const metadata: Metadata = {
  title: "Currency Crisis Tracker - Emerging Market Risk Monitor",
  description: "Monitor emerging market currencies at risk of crisis. Track debt-to-GDP, inflation, foreign reserves, and current account balances.",
  keywords: ["currency crisis", "emerging market risk", "currency devaluation", "forex risk", "sovereign debt crisis"],
};

export default function CurrencyCrisisPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Currency Crisis Tracker</h1>
        <p className="mt-3 text-lg text-gray-600">Monitor emerging market currencies vulnerable to crisis</p>
      </div>

      <CurrencyCrisisTracker />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>What Causes Currency Crises?</h2>
        <p>A currency crisis occurs when a country&apos;s currency loses significant value rapidly. Common triggers include:</p>
        <ul>
          <li><strong>High Debt-to-GDP</strong> — Unsustainable government debt levels</li>
          <li><strong>Runaway Inflation</strong> — Erodes confidence in the domestic currency</li>
          <li><strong>Low Foreign Reserves</strong> — Inability to defend the exchange rate</li>
          <li><strong>Current Account Deficits</strong> — Persistent trade imbalances</li>
        </ul>
        <h3>Historical Examples</h3>
        <p>Notable currency crises include the 1997 Asian Financial Crisis, 2001 Argentine crisis, 2018 Turkish lira crash, and the 2022 Sri Lankan default.</p>
        <p className="text-sm text-gray-500">Risk assessments are for educational purposes only.</p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "SphereVista360 Currency Crisis Tracker", description: "Monitor emerging market currency crisis risk", url: "https://spherevista360.com/tools/currency-crisis", applicationCategory: "FinanceApplication", operatingSystem: "Web" }) }} />
    </div>
  );
}

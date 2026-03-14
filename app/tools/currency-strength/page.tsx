import type { Metadata } from "next";
import { CurrencyStrengthIndex } from "@/components/tools/CurrencyStrengthIndex";

export const metadata: Metadata = {
  title: "Currency Strength Index - Global Forex Strength Meter",
  description: "Track the relative strength of major world currencies. Compare USD, EUR, GBP, JPY, CHF, and more with our real-time currency strength meter.",
  keywords: ["currency strength index", "forex strength meter", "currency comparison", "strongest currency", "weakest currency"],
};

export default function CurrencyStrengthPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Currency Strength Index</h1>
        <p className="mt-3 text-lg text-gray-600">Compare the relative strength of major world currencies</p>
      </div>

      <CurrencyStrengthIndex />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>How Currency Strength is Measured</h2>
        <p>Our currency strength index evaluates the relative value of major currencies against the US Dollar basket. Factors include exchange rate levels, recent trends, and cross-rate dynamics.</p>
        <h3>Major Currencies Tracked</h3>
        <ul>
          <li><strong>USD</strong> — US Dollar (world reserve currency)</li>
          <li><strong>EUR</strong> — Euro (second most traded)</li>
          <li><strong>GBP</strong> — British Pound Sterling</li>
          <li><strong>JPY</strong> — Japanese Yen (safe haven)</li>
          <li><strong>CHF</strong> — Swiss Franc (safe haven)</li>
        </ul>
        <p className="text-sm text-gray-500">Strength scores are indicative and for informational purposes only.</p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "SphereVista360 Currency Strength Index", description: "Track relative strength of major world currencies", url: "https://spherevista360.com/tools/currency-strength", applicationCategory: "FinanceApplication", operatingSystem: "Web" }) }} />
    </div>
  );
}

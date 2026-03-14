import type { Metadata } from "next";
import { CurrencyConverter } from "@/components/tools/CurrencyConverter";

export const metadata: Metadata = {
  title: "Currency Converter - Real-Time Exchange Rates",
  description:
    "Convert between 150+ world currencies with real-time exchange rates. Free, fast, and accurate currency conversion tool.",
  keywords: [
    "currency converter",
    "exchange rate",
    "forex",
    "currency exchange",
    "money converter",
  ],
};

export default function CurrencyConverterPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Currency Converter
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Convert between world currencies with real-time exchange rates
        </p>
      </div>

      <CurrencyConverter />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>About Currency Conversion</h2>
        <p>
          Our currency converter uses real-time exchange rates to provide
          accurate conversions between 150+ world currencies. Exchange rates
          are updated regularly throughout the day.
        </p>
        <h3>Popular Currency Pairs</h3>
        <ul>
          <li>USD to EUR (US Dollar to Euro)</li>
          <li>USD to GBP (US Dollar to British Pound)</li>
          <li>USD to JPY (US Dollar to Japanese Yen)</li>
          <li>EUR to GBP (Euro to British Pound)</li>
          <li>USD to INR (US Dollar to Indian Rupee)</li>
        </ul>
        <p className="text-sm text-gray-500">
          Exchange rates are provided for informational purposes only. For
          actual transactions, please consult your financial institution.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SphereVista360 Currency Converter",
            description:
              "Convert between 150+ world currencies with real-time exchange rates",
            url: "https://spherevista360.com/tools/currency-converter",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { CurrencyStrengthCard } from "@/components/dashboard/CurrencyStrengthCard";
import type { CurrencyStrength, CurrencyRate } from "@/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Currency Exchange Rates & Analysis",
  description:
    "Live currency exchange rates, strength analysis, and forex market insights. Track major currency pairs and global forex trends.",
};

// Demo data - replaced by live API data when configured
const demoCurrencies: CurrencyStrength[] = [
  { currency: "USD", strength: 72, change24h: 0.3, trend: "up" },
  { currency: "EUR", strength: 55, change24h: -0.2, trend: "down" },
  { currency: "GBP", strength: 60, change24h: 0.1, trend: "up" },
  { currency: "JPY", strength: 35, change24h: -0.8, trend: "down" },
  { currency: "CHF", strength: 68, change24h: 0.5, trend: "up" },
  { currency: "AUD", strength: 45, change24h: -0.4, trend: "down" },
  { currency: "CAD", strength: 52, change24h: 0.1, trend: "stable" },
  { currency: "NZD", strength: 40, change24h: -0.3, trend: "down" },
];

const demoRates: CurrencyRate[] = [
  { base: "USD", target: "EUR", rate: 0.9234, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "GBP", rate: 0.7891, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "JPY", rate: 149.85, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "CHF", rate: 0.8812, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "AUD", rate: 1.5423, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "CAD", rate: 1.3567, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "CNY", rate: 7.2341, lastUpdated: new Date().toISOString() },
  { base: "USD", target: "INR", rate: 83.42, lastUpdated: new Date().toISOString() },
];

export default function CurrenciesPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Currency Exchange Rates
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Real-time exchange rates and currency strength analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Exchange Rates Table */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            USD Exchange Rates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left font-medium text-gray-500">
                    Pair
                  </th>
                  <th className="py-3 text-right font-medium text-gray-500">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoRates.map((rate) => (
                  <tr key={rate.target} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">
                      {rate.base}/{rate.target}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-700">
                      {rate.rate.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Currency Strength */}
        <CurrencyStrengthCard data={demoCurrencies} />
      </div>

      <div className="mt-8 text-center">
        <Link href="/tools/currency-converter" className="btn-primary">
          Open Currency Converter →
        </Link>
      </div>
    </div>
  );
}

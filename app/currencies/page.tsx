import type { Metadata } from "next";
import { CurrencyStrengthCard } from "@/components/dashboard/CurrencyStrengthCard";
import { getCurrencyRates, getCurrencyStrength } from "@/lib/fetch-live-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Currency Exchange Rates & Analysis",
  description:
    "Live currency exchange rates, strength analysis, and forex market insights. Track major currency pairs and global forex trends.",
};

export default async function CurrenciesPage() {
  const [ratesResult, strengthResult] = await Promise.all([
    getCurrencyRates(),
    getCurrencyStrength(),
  ]);

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
                {ratesResult.rates.map((rate) => (
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
        <CurrencyStrengthCard data={strengthResult.data} />
      </div>

      <div className="mt-8 text-center">
        <Link href="/tools/currency-converter" className="btn-primary">
          Open Currency Converter →
        </Link>
      </div>
    </div>
  );
}

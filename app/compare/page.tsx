import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISONS } from "@/lib/comparisons";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Investment Comparisons - Compare Assets & Strategies | SphereVista360",
  description:
    "Compare investments side by side: Gold vs Bitcoin, Stocks vs Bonds, SIP vs Lump Sum, and 20+ more comparison guides to help you make informed financial decisions.",
  keywords: [
    "investment comparison",
    "gold vs bitcoin",
    "stocks vs bonds",
    "compare investments",
    "asset comparison",
  ],
};

const categories = [
  { key: "precious-metals", label: "Precious Metals & Crypto" },
  { key: "crypto", label: "Cryptocurrency" },
  { key: "stocks", label: "Stock Market" },
  { key: "savings", label: "Savings & Tax" },
  { key: "currency", label: "Currency" },
  { key: "real-assets", label: "Real Assets" },
  { key: "commodities", label: "Commodities" },
  { key: "insurance", label: "Insurance" },
  { key: "retirement", label: "Retirement" },
];

export default function CompareIndexPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Investment Comparisons
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Side-by-side comparison guides for popular investments, strategies, and
          financial products.
        </p>
      </div>

      {categories.map((cat) => {
        const items = COMPARISONS.filter((c) => c.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {cat.label}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/compare/${comp.slug}`}
                  className="card group flex items-start gap-3 transition-all hover:border-brand-200 hover:shadow-lg"
                >
                  <div className="rounded-lg bg-purple-100 p-2 transition-transform group-hover:scale-110">
                    <Scale className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">
                      {comp.asset1} vs {comp.asset2}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {comp.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

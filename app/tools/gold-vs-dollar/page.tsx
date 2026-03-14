import type { Metadata } from "next";
import { GoldVsDollar } from "@/components/tools/GoldVsDollar";

export const metadata: Metadata = {
  title: "Gold vs Dollar - Historical Performance Comparison",
  description: "Compare gold investment returns against US Dollar purchasing power over time. See how gold preserves value while the dollar loses purchasing power to inflation.",
  keywords: ["gold vs dollar", "gold investment", "gold price history", "dollar purchasing power", "gold hedge inflation"],
};

export default function GoldVsDollarPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Gold vs Dollar</h1>
        <p className="mt-3 text-lg text-gray-600">Compare gold investment performance against US Dollar purchasing power</p>
      </div>

      <GoldVsDollar />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>Gold as an Inflation Hedge</h2>
        <p>Gold has been a store of value for thousands of years. While the US Dollar loses purchasing power to inflation over time, gold has historically maintained — and often increased — its real value.</p>
        <h3>Key Comparisons</h3>
        <ul>
          <li><strong>2000–2026</strong> — Gold rose from ~$279 to ~$2,950/oz (+957%) while the dollar lost ~47% of its purchasing power</li>
          <li><strong>Gold during crises</strong> — Tends to rise during economic uncertainty and market stress</li>
          <li><strong>Dollar strength</strong> — The DXY index shows relative strength vs other currencies, not purchasing power</li>
        </ul>
        <p className="text-sm text-gray-500">Historical data is approximate. Past performance does not guarantee future results.</p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "SphereVista360 Gold vs Dollar", description: "Compare gold investment performance against US Dollar", url: "https://spherevista360.com/tools/gold-vs-dollar", applicationCategory: "FinanceApplication", operatingSystem: "Web" }) }} />
    </div>
  );
}

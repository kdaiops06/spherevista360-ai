import type { Metadata } from "next";
import { CompoundInterestCalculator } from "@/components/tools/CompoundInterestCalculator";

export const metadata: Metadata = {
  title: "Compound Interest Calculator - Investment Growth",
  description:
    "Calculate compound interest on your investments. See how your money grows over time with regular contributions and compound growth.",
};

export default function CompoundInterestPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Compound Interest Calculator
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Visualize how your investments grow with the power of compounding
        </p>
      </div>

      <CompoundInterestCalculator />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>The Power of Compound Interest</h2>
        <p>
          Compound interest is the interest on a loan or deposit that is
          calculated based on both the initial principal and the accumulated
          interest from previous periods. Albert Einstein reportedly called it
          the &quot;eighth wonder of the world.&quot;
        </p>
        <h3>Key Factors</h3>
        <ul>
          <li><strong>Principal</strong> - Your initial investment amount</li>
          <li><strong>Interest Rate</strong> - Annual return on investment</li>
          <li><strong>Time</strong> - The longer you invest, the more compounding works</li>
          <li><strong>Compounding Frequency</strong> - How often interest is calculated</li>
          <li><strong>Regular Contributions</strong> - Adding money consistently accelerates growth</li>
        </ul>
        <p className="text-sm text-gray-500">
          This calculator is for educational purposes only and does not
          constitute financial advice.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SphereVista360 Compound Interest Calculator",
            description: "Calculate compound interest on your investments",
            url: "https://spherevista360.com/tools/compound-interest",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}

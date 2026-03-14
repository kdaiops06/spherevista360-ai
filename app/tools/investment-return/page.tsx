import type { Metadata } from "next";
import { InvestmentReturnCalculator } from "@/components/tools/InvestmentReturnCalculator";

export const metadata: Metadata = {
  title: "Investment Return Calculator - CAGR & Total Return",
  description: "Calculate your investment returns including CAGR (Compound Annual Growth Rate), total return percentage, and profit/loss on any investment.",
  keywords: ["investment return calculator", "CAGR calculator", "return on investment", "ROI calculator", "investment profit"],
};

export default function InvestmentReturnPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Investment Return Calculator</h1>
        <p className="mt-3 text-lg text-gray-600">Calculate CAGR and total returns on your investments</p>
      </div>

      <InvestmentReturnCalculator />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>Understanding Investment Returns</h2>
        <p>Investment returns measure how much your money has grown over a period. Two key metrics are:</p>
        <ul>
          <li><strong>Total Return</strong> — The overall gain or loss expressed as a percentage</li>
          <li><strong>CAGR</strong> — Compound Annual Growth Rate, the smoothed annual return that accounts for compounding</li>
        </ul>
        <h3>Why CAGR Matters</h3>
        <p>CAGR provides a better comparison between investments of different durations. A 50% total return over 10 years is very different from 50% over 2 years — CAGR reveals this difference.</p>
        <p className="text-sm text-gray-500">This calculator is for educational purposes only.</p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "SphereVista360 Investment Return Calculator", description: "Calculate CAGR and total investment returns", url: "https://spherevista360.com/tools/investment-return", applicationCategory: "FinanceApplication", operatingSystem: "Web" }) }} />
    </div>
  );
}

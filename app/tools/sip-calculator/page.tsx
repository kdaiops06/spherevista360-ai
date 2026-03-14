import type { Metadata } from "next";
import { SIPCalculator } from "@/components/tools/SIPCalculator";

export const metadata: Metadata = {
  title: "SIP Calculator - Systematic Investment Plan Returns",
  description: "Calculate returns on your Systematic Investment Plan (SIP). See how regular monthly investments grow over time with the power of compounding.",
  keywords: ["SIP calculator", "systematic investment plan", "SIP returns", "mutual fund calculator", "monthly investment"],
};

export default function SIPCalculatorPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">SIP Calculator</h1>
        <p className="mt-3 text-lg text-gray-600">Calculate how your systematic monthly investments grow over time</p>
      </div>

      <SIPCalculator />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>What is a SIP?</h2>
        <p>A Systematic Investment Plan (SIP) is an investment strategy where you invest a fixed amount regularly — typically monthly — into mutual funds or other investment vehicles. SIPs leverage rupee-cost averaging and the power of compounding to build wealth over time.</p>
        <h3>Benefits of SIP</h3>
        <ul>
          <li><strong>Disciplined Investing</strong> — Automates your savings habit</li>
          <li><strong>Rupee Cost Averaging</strong> — Buy more units when prices are low</li>
          <li><strong>Power of Compounding</strong> — Earnings generate their own returns</li>
          <li><strong>Flexibility</strong> — Start with small amounts and increase over time</li>
        </ul>
        <p className="text-sm text-gray-500">This calculator is for educational purposes only and does not constitute financial advice.</p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "SphereVista360 SIP Calculator", description: "Calculate systematic investment plan returns", url: "https://spherevista360.com/tools/sip-calculator", applicationCategory: "FinanceApplication", operatingSystem: "Web" }) }} />
    </div>
  );
}

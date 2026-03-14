import type { Metadata } from "next";
import { RecessionTracker } from "@/components/tools/RecessionTracker";

export const metadata: Metadata = {
  title: "Recession Probability Tracker - Economic Risk Monitor",
  description: "Track the probability of an economic recession using key indicators: yield curve, unemployment, PMI, consumer confidence, and more.",
  keywords: ["recession tracker", "recession probability", "economic recession", "yield curve inversion", "recession indicators"],
};

export default function RecessionTrackerPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Recession Probability Tracker</h1>
        <p className="mt-3 text-lg text-gray-600">Monitor key economic indicators that signal recession risk</p>
      </div>

      <RecessionTracker />

      <div className="mt-12 max-w-2xl mx-auto prose prose-gray">
        <h2>How We Measure Recession Risk</h2>
        <p>Our tracker combines six key economic indicators, each weighted by their historical reliability in predicting recessions:</p>
        <ul>
          <li><strong>Yield Curve Spread</strong> — Inverted yield curves preceded every US recession since 1970</li>
          <li><strong>Unemployment Rate</strong> — Rising unemployment signals economic contraction</li>
          <li><strong>Consumer Confidence</strong> — Consumer sentiment drives spending (70% of GDP)</li>
          <li><strong>Manufacturing PMI</strong> — Below 50 indicates manufacturing contraction</li>
          <li><strong>Leading Economic Index</strong> — Conference Board composite of forward-looking indicators</li>
          <li><strong>Credit Spreads</strong> — Widening spreads signal increased default risk</li>
        </ul>
        <p className="text-sm text-gray-500">This tool is for educational purposes only and does not constitute economic forecasting advice.</p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "SphereVista360 Recession Probability Tracker", description: "Track economic recession probability using key indicators", url: "https://spherevista360.com/tools/recession-tracker", applicationCategory: "FinanceApplication", operatingSystem: "Web" }) }} />
    </div>
  );
}

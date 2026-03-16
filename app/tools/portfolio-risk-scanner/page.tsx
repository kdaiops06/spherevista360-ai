import type { Metadata } from "next";
import { PortfolioRiskScanner } from "@/components/tools/PortfolioRiskScanner";

export const metadata: Metadata = {
  title: "AI Portfolio Risk Scanner - Diversification and Correlation",
  description:
    "Scan your asset mix for diversification quality, volatility risk, and correlation concentration.",
};

export default function PortfolioRiskScannerPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">AI Portfolio Risk Scanner</h1>
        <p className="mt-3 text-lg text-gray-600">Check diversification, volatility, and hidden correlation risk</p>
      </div>
      <PortfolioRiskScanner />
    </div>
  );
}
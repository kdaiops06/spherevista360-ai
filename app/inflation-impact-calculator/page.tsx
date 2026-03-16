import type { Metadata } from "next";
import { InflationCalculator } from "@/components/tools/InflationCalculator";

export const metadata: Metadata = {
  title: "Inflation Impact Calculator - Purchasing Power Over Time",
  description:
    "Calculate inflation impact over time and estimate future cost, purchasing power, and total inflation.",
};

export default function InflationImpactCalculatorPage() {
  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Inflation Impact Calculator</h1>
      <p className="text-lg text-gray-600 mb-8">Understand how inflation changes cost of living and savings value.</p>
      <InflationCalculator />
    </div>
  );
}
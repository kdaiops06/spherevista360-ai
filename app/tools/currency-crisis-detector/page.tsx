import type { Metadata } from "next";
import { CurrencyCrisisDetector } from "@/components/tools/CurrencyCrisisDetector";

export const metadata: Metadata = {
  title: "Currency Crisis Detector - High Risk Currencies",
  description:
    "Identify currencies with elevated crisis risk based on inflation, reserves, and debt stress indicators.",
};

export default function CurrencyCrisisDetectorPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Currency Crisis Detector</h1>
        <p className="mt-3 text-lg text-gray-600">Detect vulnerable currencies with macro stress scoring</p>
      </div>
      <CurrencyCrisisDetector />
    </div>
  );
}
import type { Metadata } from "next";
import { GlobalStressIndex } from "@/components/tools/GlobalStressIndex";

export const metadata: Metadata = {
  title: "Global Economic Stress Index - Daily Macro Risk Score",
  description:
    "Track inflation, debt, geopolitics, and currency volatility in one Global Economic Stress Index (0-100).",
};

export default function GlobalStressIndexPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Global Economic Stress Index</h1>
        <p className="mt-3 text-lg text-gray-600">One score to monitor macro stress across global markets</p>
      </div>
      <GlobalStressIndex />
    </div>
  );
}
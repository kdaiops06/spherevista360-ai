"use client";
import React, { useState } from "react";
import PremiumFakeDoor from "../../components/portfolio/PremiumFakeDoor";
import PortfolioInput from "../../components/portfolio/PortfolioInput";
import PortfolioSummary from "../../components/portfolio/PortfolioSummary";
import PortfolioRisk from "../../components/portfolio/PortfolioRisk";
import PortfolioSuggestions from "../../components/portfolio/PortfolioSuggestions";
import PortfolioInsights from "../../components/portfolio/PortfolioInsights";
import { calculatePortfolioRisk } from "../../lib/portfolio/risk";
import { generatePortfolioSuggestions } from "../../lib/portfolio/suggestions";
import type { Asset } from "../../lib/portfolio/calculations";

const PortfolioAnalyzerPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [premium, setPremium] = useState(false);

  const handleSetAssets: React.Dispatch<React.SetStateAction<Asset[]>> = (value) => {
    setLoading(true);
    setAssets((prev) => {
      const result =
        typeof value === "function"
          ? (value as (prevState: Asset[]) => Asset[])(prev)
          : value;
      setTimeout(() => setLoading(false), 600);
      return result;
    });
  };

  const risk = calculatePortfolioRisk(assets);
  const suggestions = generatePortfolioSuggestions(assets, { premium, riskLevel: risk.level });

  let overexposureBlock = null;
  if (!loading && assets.length > 0) {
    const total = assets.reduce((sum, asset) => sum + asset.amount, 0);
    const allocation = total > 0 ? assets.map(a => ({ ...a, percentage: (a.amount / total) * 100 })) : [];
    const overAsset = allocation.find(a => a.percentage > 40);

    if (overAsset) {
      overexposureBlock = (
        <div className="my-4 flex items-start gap-3 rounded-lg border border-amber-400/35 bg-amber-500/12 p-4 text-amber-100">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/35 text-sm font-semibold">
            !
          </span>
          <p className="text-sm font-medium leading-6">
            You are heavily concentrated in {overAsset.ticker} ({overAsset.percentage.toFixed(1)}%).
            <br />
            This exposes you to significant single-stock risk.
          </p>
        </div>
      );
    }
  }

  return (
    <main className="container-main py-8">
      <section className="mx-auto max-w-xl">
        <PortfolioInput assets={assets} setAssets={handleSetAssets} />

        {loading && assets.length > 0 && (
          <div className="my-8 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-300">
            Analyzing your portfolio...
          </div>
        )}

        {!loading && assets.length > 0 && (
          <>
            <div className="mt-6" />
            <PortfolioSummary assets={assets} />
            <div className="mt-6" />
            <PortfolioRisk risk={risk} />
            {overexposureBlock}
            <div className="mt-6" />
            <div className="mb-2 mt-8 text-lg font-medium tracking-tight text-slate-100">
              Portfolio Insights
            </div>
            <PortfolioInsights assets={assets} />
            <div className="mt-6" />
            <PortfolioSuggestions suggestions={suggestions} />
          </>
        )}

        {!loading && assets.length > 0 && (
          <PremiumFakeDoor onUnlock={() => setPremium(true)} />
        )}
      </section>
    </main>
  );
};

export default PortfolioAnalyzerPage;

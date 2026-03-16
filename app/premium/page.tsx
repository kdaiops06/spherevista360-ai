import type { Metadata } from "next";
import Link from "next/link";
import { Brain, BellRing, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "SphereVista360 Premium - Advanced Forecasts and Alerts",
  description:
    "Upgrade to Premium for advanced forecasts, AI portfolio risk analysis, macro alerts, and deeper prediction models.",
};

const premiumFeatures = [
  { icon: Brain, name: "Advanced Forecast Models", detail: "Scenario-driven forecast bands and higher-depth macro factor attribution." },
  { icon: Shield, name: "Portfolio Risk Intelligence", detail: "Correlations, concentration risk, drawdown stress, and diversification diagnostics." },
  { icon: BellRing, name: "Macroeconomic Alerts", detail: "Daily and intraday triggers for recession probability and global stress regime shifts." },
];

export default function PremiumPage() {
  return (
    <div className="container-main py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900">SphereVista360 Premium</h1>
        <p className="mt-3 text-lg text-gray-600">
          Upgrade for deeper AI financial intelligence and faster decision-ready signals.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-10 grid gap-5 md:grid-cols-3">
        {premiumFeatures.map((feature) => (
          <div key={feature.name} className="card">
            <feature.icon className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{feature.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{feature.detail}</p>
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-brand-600 font-semibold">Premium Plan</p>
        <p className="text-5xl font-bold text-gray-900 mt-2">$15<span className="text-lg font-medium text-gray-500">/month</span></p>
        <p className="text-sm text-gray-600 mt-3">Cancel anytime. Early members get historical signal archive access.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/contact" className="btn-primary">Start Premium</Link>
          <Link href="/tools" className="btn-secondary">Explore Free Tools</Link>
        </div>
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import { Globe, Brain, BarChart3, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "About SphereVista360",
  description:
    "Learn about SphereVista360 — an AI-powered financial intelligence platform delivering real-time market insights, currency analytics, and economic predictions.",
};

export default function AboutPage() {
  return (
    <div className="container-main py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">
          About SphereVista360
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          SphereVista360 is an AI-powered financial intelligence platform that
          combines real-time market data, machine learning predictions, and
          automated content generation to deliver actionable financial insights.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {[
            { icon: Brain, title: "AI-Powered Analysis", desc: "Our AI agents analyze market data, news sentiment, and economic indicators to generate insights and predictions." },
            { icon: Globe, title: "Global Coverage", desc: "Track currencies, commodities, equities, and economic indicators from markets around the world." },
            { icon: BarChart3, title: "Real-Time Data", desc: "Data sourced from Alpha Vantage, FRED, and leading exchange rate providers, updated throughout the day." },
            { icon: Wrench, title: "Free Tools", desc: "Currency converter, inflation calculator, compound interest calculator, and purchasing power calculator — all free to use." },
          ].map((item) => (
            <div key={item.title} className="card">
              <item.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 prose prose-gray max-w-none">
          <h2>Our Mission</h2>
          <p>
            We believe financial intelligence should be accessible to everyone.
            SphereVista360 democratizes access to market analysis, economic data,
            and AI-driven predictions that were previously available only to
            institutional investors.
          </p>
          <h2>Technology</h2>
          <p>
            Built with Next.js, TypeScript, and TailwindCSS, powered by Claude
            and GPT AI models. Our platform pulls data from Alpha Vantage,
            ExchangeRate API, FRED, and News API to deliver comprehensive
            financial coverage.
          </p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { INFLATION_DATA, getInflationBySlug } from "@/lib/inflation-data";

export async function generateStaticParams() {
  return INFLATION_DATA.map((e) => ({ slug: e.slug }));
}

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getInflationBySlug(slug);
  if (!entry) return { title: "Inflation Rate | SphereVista360" };

  return {
    title: `${entry.country} Inflation Rate – Current CPI & Analysis | SphereVista360`,
    description: `${entry.country} inflation rate is ${entry.currentRate}%. Track CPI data, ${entry.centralBank} policy, historical trends, and economic impact.`,
    keywords: [
      `${entry.country} inflation rate`,
      `${entry.country} CPI`,
      `${entry.centralBank} inflation`,
      `${entry.currency} inflation`,
      "inflation tracker",
    ],
    alternates: { canonical: `/inflation/${slug}` },
  };
}

export default async function InflationPage({ params }: Props) {
  const { slug } = await params;
  const entry = getInflationBySlug(slug);
  if (!entry) notFound();

  const deviation = entry.currentRate - entry.targetRate;
  const status =
    Math.abs(deviation) < 0.5
      ? "On Target"
      : deviation > 0
        ? "Above Target"
        : "Below Target";
  const statusColor =
    Math.abs(deviation) < 0.5
      ? "text-green-600"
      : deviation > 0
        ? "text-red-600"
        : "text-blue-600";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the current inflation rate in ${entry.country}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The current inflation rate in ${entry.country} is approximately ${entry.currentRate}%, as measured by CPI. The ${entry.centralBank} targets ${entry.targetRate}%.`,
        },
      },
      {
        "@type": "Question",
        name: `What does the ${entry.centralBank} do about inflation?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${entry.centralBank} uses monetary policy tools — primarily interest rates — to manage inflation toward its target of ${entry.targetRate}%.`,
        },
      },
    ],
  };

  const relatedCountries = INFLATION_DATA.filter((e) => e.slug !== slug).slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-red-700 to-orange-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-red-200 text-sm uppercase tracking-wide mb-2">
              Inflation Tracker
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              {entry.country} Inflation Rate
            </h1>
            <p className="mt-2 text-red-200">
              Current CPI: {entry.currentRate}% | Target: {entry.targetRate}% |{" "}
              Central Bank: {entry.centralBank}
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Key stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-xl p-5 border text-center">
              <p className="text-sm text-gray-600">Current Rate</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {entry.currentRate}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border text-center">
              <p className="text-sm text-gray-600">Target Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {entry.targetRate}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border text-center">
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-2xl font-bold mt-1 ${statusColor}`}>
                {status}
              </p>
              <p className="text-xs text-gray-500">
                {deviation > 0 ? "+" : ""}
                {deviation.toFixed(1)}% vs target
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-indigo max-w-none bg-white rounded-xl p-6 border">
            <h2>Inflation in {entry.country}</h2>
            <p>
              {entry.country}&apos;s inflation rate currently stands at{" "}
              {entry.currentRate}%, as measured by the Consumer Price Index
              (CPI). The {entry.centralBank} aims to keep inflation near its
              target of {entry.targetRate}%.
            </p>

            <h3>Impact on the {entry.currency}</h3>
            <p>
              Inflation directly impacts the purchasing power of the{" "}
              {entry.currency}. When inflation exceeds the central bank&apos;s
              target, the {entry.centralBank} may raise interest rates, which
              can strengthen the {entry.currency} but slow economic growth.
            </p>

            <h3>What Drives Inflation in {entry.country}?</h3>
            <ul>
              <li>Supply chain disruptions and commodity prices</li>
              <li>Domestic demand and employment levels</li>
              <li>Government fiscal policy and spending</li>
              <li>Global energy prices</li>
              <li>{entry.centralBank} monetary policy decisions</li>
            </ul>

            <h3>How to Protect Against Inflation</h3>
            <p>
              Investors in {entry.country} can hedge against inflation through
              inflation-indexed bonds, real assets like real estate and gold,
              equities with pricing power, and diversified international
              portfolios.
            </p>
          </div>

          {/* Related */}
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold text-gray-900 mb-3">
              Inflation Rates by Country
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {relatedCountries.map((c) => (
                <Link
                  key={c.slug}
                  href={`/inflation/${c.slug}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {c.country} ({c.currentRate}%)
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center py-4">
            <Link
              href="/tools/inflation-calculator"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Use Inflation Calculator
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

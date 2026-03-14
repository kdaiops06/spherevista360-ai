import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COMPARISONS, getComparisonBySlug, getRelatedComparisons } from "@/lib/comparisons";

export async function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export const revalidate = 86400; // 24 hours

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = getComparisonBySlug(slug);
  if (!comp) return { title: "Comparison | SphereVista360" };

  return {
    title: `${comp.title} | SphereVista360`,
    description: comp.description,
    keywords: [
      `${comp.asset1} vs ${comp.asset2}`,
      `${comp.asset1.toLowerCase()} comparison`,
      `${comp.asset2.toLowerCase()} comparison`,
      "investment comparison",
      "which is better",
    ],
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: comp.title,
      description: comp.description,
      type: "article",
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comp = getComparisonBySlug(slug);
  if (!comp) notFound();

  const related = getRelatedComparisons(slug, 4);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Which is better: ${comp.asset1} or ${comp.asset2}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The choice between ${comp.asset1} and ${comp.asset2} depends on your investment goals, risk tolerance, and time horizon. ${comp.asset1} and ${comp.asset2} each have unique advantages — read our detailed comparison for a thorough analysis.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${comp.asset1} a better investment than ${comp.asset2}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Both ${comp.asset1} and ${comp.asset2} have delivered strong returns historically, but they serve different roles in a portfolio. Consider diversifying across both based on your financial situation.`,
        },
      },
      {
        "@type": "Question",
        name: `What are the risks of ${comp.asset1} vs ${comp.asset2}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${comp.asset1} and ${comp.asset2} carry different risk profiles. Our comparison breaks down volatility, drawdown history, and risk-adjusted returns for each.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-purple-200 text-sm mb-2 uppercase tracking-wide">
              Investment Comparison
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">{comp.title}</h1>
            <p className="mt-3 text-purple-200">{comp.description}</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Quick comparison table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-gray-600">Factor</th>
                  <th className="px-6 py-3 text-center text-gray-900 font-semibold">
                    {comp.asset1}
                  </th>
                  <th className="px-6 py-3 text-center text-gray-900 font-semibold">
                    {comp.asset2}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-6 py-3 text-gray-600">Risk Level</td>
                  <td className="px-6 py-3 text-center">Moderate</td>
                  <td className="px-6 py-3 text-center">Varies</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-600">Liquidity</td>
                  <td className="px-6 py-3 text-center">High</td>
                  <td className="px-6 py-3 text-center">High</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-600">Inflation Hedge</td>
                  <td className="px-6 py-3 text-center">Yes</td>
                  <td className="px-6 py-3 text-center">Partial</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-600">Income Generation</td>
                  <td className="px-6 py-3 text-center">No</td>
                  <td className="px-6 py-3 text-center">Yes</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-600">Minimum Investment</td>
                  <td className="px-6 py-3 text-center">Low</td>
                  <td className="px-6 py-3 text-center">Low</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SEO Content */}
          <div className="prose prose-indigo max-w-none bg-white rounded-xl p-6 border border-gray-200">
            <h2>
              {comp.asset1} vs {comp.asset2}: Complete Comparison
            </h2>
            <p>
              Choosing between {comp.asset1} and {comp.asset2} is one of the
              most common decisions investors face. Both have unique
              characteristics that make them suitable for different investment
              strategies and financial goals.
            </p>

            <h3>What Is {comp.asset1}?</h3>
            <p>
              {comp.asset1} has long been considered a{" "}
              {comp.category === "precious-metals"
                ? "store of value and a hedge against economic uncertainty"
                : comp.category === "crypto"
                  ? "revolutionary digital asset class with high growth potential"
                  : "fundamental building block of a diversified investment portfolio"}
              . Investors turn to {comp.asset1} for its unique combination of
              risk and return characteristics.
            </p>

            <h3>What Is {comp.asset2}?</h3>
            <p>
              {comp.asset2} offers investors a{" "}
              {comp.category === "stocks"
                ? "different risk-return profile with its own set of advantages in portfolio construction"
                : comp.category === "savings"
                  ? "structured approach to wealth building with specific tax and liquidity characteristics"
                  : "complementary investment option that serves different purposes in financial planning"}
              . Understanding how {comp.asset2} works is essential for making
              an informed comparison.
            </p>

            <h3>Historical Performance</h3>
            <p>
              When comparing {comp.asset1} and {comp.asset2} historically,
              the results depend heavily on the time period examined. Short-term
              performance can vary dramatically, while long-term trends tend to
              be more stable and predictable.
            </p>

            <h3>Risk Comparison</h3>
            <p>
              Risk is multi-dimensional — it includes volatility, maximum
              drawdown, correlation to other assets, and tail risk. {comp.asset1}{" "}
              and {comp.asset2} exhibit different risk characteristics, making
              them complementary in a diversified portfolio.
            </p>

            <h3>Which Should You Choose?</h3>
            <p>
              The decision between {comp.asset1} and {comp.asset2} ultimately
              depends on your investment goals, risk tolerance, time horizon,
              and overall portfolio composition. Many financial advisors
              recommend holding both as part of a diversified strategy.
            </p>

            <blockquote>
              <strong>Disclaimer:</strong> This comparison is for informational
              purposes only and does not constitute financial advice. Past
              performance does not guarantee future results. Consult a qualified
              financial advisor before making investment decisions.
            </blockquote>
          </div>

          {/* Related comparisons */}
          {related.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Related Comparisons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/compare/${r.slug}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    {r.asset1} vs {r.asset2}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back links */}
          <div className="flex justify-center gap-6 py-4 text-sm">
            <Link
              href="/compare"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← All Comparisons
            </Link>
            <Link
              href="/tools"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Financial Tools →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

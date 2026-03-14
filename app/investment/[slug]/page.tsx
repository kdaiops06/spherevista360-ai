import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { INVESTMENT_GUIDES, getGuideBySlug, getRelatedGuides } from "@/lib/investment-data";

export async function generateStaticParams() {
  return INVESTMENT_GUIDES.map((g) => ({ slug: g.slug }));
}

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Investment Guide | SphereVista360" };

  return {
    title: `${guide.title} | SphereVista360`,
    description: guide.description,
    keywords: [
      guide.title.split(":")[0],
      "investing guide",
      guide.category,
      "how to invest",
      "investment strategy",
    ],
    alternates: { canonical: `/investment/${slug}` },
  };
}

export default async function InvestmentGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const related = getRelatedGuides(slug, 6);

  const riskColor = {
    Low: "bg-green-100 text-green-700",
    Moderate: "bg-yellow-100 text-yellow-700",
    High: "bg-orange-100 text-orange-700",
    "Very High": "bg-red-100 text-red-700",
  }[guide.riskLevel];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much do I need to start ${guide.title.split(":")[0].toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can start with as little as ${guide.minInvestment}. The recommended time horizon is ${guide.timeHorizon}.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the risk level of this investment?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `This investment has a ${guide.riskLevel.toLowerCase()} risk level. Always consider your personal risk tolerance before investing.`,
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
        <section className="bg-gradient-to-r from-green-700 to-teal-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-green-200 text-sm uppercase tracking-wide mb-2">
              Investment Guide
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">{guide.title}</h1>
            <p className="mt-2 text-green-200">{guide.description}</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Quick facts */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-xl p-5 border text-center">
              <p className="text-sm text-gray-600">Risk Level</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${riskColor}`}
              >
                {guide.riskLevel}
              </span>
            </div>
            <div className="bg-white rounded-xl p-5 border text-center">
              <p className="text-sm text-gray-600">Minimum Investment</p>
              <p className="text-xl font-bold text-gray-900 mt-2">
                {guide.minInvestment}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border text-center">
              <p className="text-sm text-gray-600">Time Horizon</p>
              <p className="text-xl font-bold text-gray-900 mt-2">
                {guide.timeHorizon}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-indigo max-w-none bg-white rounded-xl p-6 border">
            <h2>Overview</h2>
            <p>
              This guide covers everything you need to know about{" "}
              {guide.title.split(":")[0].toLowerCase()}. Whether you&apos;re a
              beginner or experienced investor, understanding the fundamentals
              is crucial for making informed decisions.
            </p>

            <h3>How It Works</h3>
            <p>
              {guide.category === "stocks"
                ? "Stock investing involves buying ownership shares in publicly traded companies. Returns come from capital appreciation and dividends."
                : guide.category === "crypto"
                  ? "Cryptocurrency investing involves buying digital assets on exchanges. Returns come from price appreciation driven by adoption and market sentiment."
                  : guide.category === "fixed-income"
                    ? "Fixed income investments provide regular interest payments and return of principal at maturity. They offer predictable income streams."
                    : guide.category === "real-estate"
                      ? "Real estate investing generates returns through rental income and property appreciation. Options range from direct ownership to REITs."
                      : "This investment category offers unique risk-return characteristics that can complement a diversified portfolio."}
            </p>

            <h3>Benefits</h3>
            <ul>
              <li>Portfolio diversification across asset classes</li>
              <li>Potential for long-term wealth creation</li>
              <li>
                {guide.riskLevel === "Low"
                  ? "Capital preservation with steady returns"
                  : guide.riskLevel === "Moderate"
                    ? "Balanced risk-reward profile"
                    : "Higher potential returns for accepting greater risk"}
              </li>
              <li>Accessible with a minimum of {guide.minInvestment}</li>
            </ul>

            <h3>Risks to Consider</h3>
            <ul>
              <li>Market volatility and potential for loss</li>
              <li>Liquidity risk depending on the investment type</li>
              <li>Inflation risk eroding real returns</li>
              <li>Time horizon mismatch if funds are needed early</li>
            </ul>

            <h3>Getting Started</h3>
            <p>
              Begin by assessing your financial goals, risk tolerance, and time
              horizon. Start with a small allocation of {guide.minInvestment}{" "}
              and increase gradually as you gain experience. Consider using our{" "}
              <Link href="/tools/compound-interest">compound interest calculator</Link>{" "}
              to project potential returns.
            </p>

            <blockquote>
              <strong>Disclaimer:</strong> This guide is for informational
              purposes only. Past performance does not guarantee future results.
              Consult a qualified financial advisor before making investment
              decisions.
            </blockquote>
          </div>

          {/* Related guides */}
          {related.length > 0 && (
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="font-semibold text-gray-900 mb-3">
                Related Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {related.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/investment/${g.slug}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {g.title.split(":")[0]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center py-4">
            <Link
              href="/tools"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Financial Tools
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

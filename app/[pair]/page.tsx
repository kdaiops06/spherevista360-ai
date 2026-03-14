import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CURRENCY_LIST,
  generateAllPairs,
  parsePairSlug,
  getCurrencyByCode,
} from "@/lib/currency-pairs";
import CurrencyPairConverter from "@/components/seo/CurrencyPairConverter";

// Generate the top 200 pairs at build time, rest on-demand
const TOP_CURRENCIES = [
  "USD","EUR","GBP","JPY","CHF","AUD","CAD","NZD","CNY","INR",
  "SGD","HKD","KRW","BRL","MXN","ZAR",
];

export async function generateStaticParams() {
  const params: { pair: string }[] = [];
  for (const from of TOP_CURRENCIES) {
    for (const to of TOP_CURRENCIES) {
      if (from === to) continue;
      params.push({ pair: `${from.toLowerCase()}-to-${to.toLowerCase()}` });
    }
  }
  return params;
}

export const dynamicParams = true;
export const revalidate = 3600; // ISR: revalidate every hour

type Props = {
  params: Promise<{ pair: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) return { title: "Currency Converter | SphereVista360" };

  const from = getCurrencyByCode(parsed.from)!;
  const to = getCurrencyByCode(parsed.to)!;

  return {
    title: `Convert ${from.name} to ${to.name} (${from.code}/${to.code}) – Live Rate | SphereVista360`,
    description: `Convert ${from.code} to ${to.code} with live exchange rates. ${from.name} to ${to.name} converter, historical data, and ${from.code}/${to.code} analysis.`,
    keywords: [
      `${from.code} to ${to.code}`,
      `${from.code}/${to.code} exchange rate`,
      `convert ${from.name} to ${to.name}`,
      `${from.code} ${to.code} converter`,
      `1 ${from.code} to ${to.code}`,
      "currency converter",
      "exchange rate",
      "forex",
    ],
    alternates: {
      canonical: `/${pair}`,
    },
    openGraph: {
      title: `${from.code} to ${to.code} – Live Exchange Rate`,
      description: `Real-time ${from.name} to ${to.name} conversion with live rates and analysis.`,
      type: "website",
    },
  };
}

export default async function CurrencyPairPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) notFound();

  const from = getCurrencyByCode(parsed.from)!;
  const to = getCurrencyByCode(parsed.to)!;

  const reverseSlug = `${to.code.toLowerCase()}-to-${from.code.toLowerCase()}`;

  // Related pairs for internal linking
  const relatedFromPairs = CURRENCY_LIST.filter(
    (c) => c.code !== from.code && c.code !== to.code
  )
    .slice(0, 8)
    .map((c) => ({
      slug: `${from.code.toLowerCase()}-to-${c.code.toLowerCase()}`,
      label: `${from.code}/${c.code}`,
    }));

  const relatedToPairs = CURRENCY_LIST.filter(
    (c) => c.code !== from.code && c.code !== to.code
  )
    .slice(0, 8)
    .map((c) => ({
      slug: `${c.code.toLowerCase()}-to-${to.code.toLowerCase()}`,
      label: `${c.code}/${to.code}`,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${from.code} to ${to.code} Currency Converter`,
    description: `Convert ${from.name} to ${to.name} with live exchange rates`,
    url: `https://spherevista360.com/${pair}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much is 1 ${from.code} in ${to.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Use our live converter above to see the current ${from.code} to ${to.code} exchange rate. Rates update every 5 minutes.`,
        },
      },
      {
        "@type": "Question",
        name: `Where can I convert ${from.name} to ${to.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can convert ${from.code} to ${to.code} using our free online converter at SphereVista360. For physical currency exchange, visit banks, exchange bureaus, or airports.`,
        },
      },
      {
        "@type": "Question",
        name: `Is it a good time to convert ${from.code} to ${to.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Exchange rates fluctuate based on market conditions. Check our converter for the current rate and consider monitoring the rate over time for the best value.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Convert {from.name} to {to.name}
            </h1>
            <p className="text-indigo-200 text-lg">
              {from.code}/{to.code} – Live Exchange Rate &amp; Free Converter
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Converter widget */}
          <CurrencyPairConverter
            fromCode={from.code}
            toCode={to.code}
            fromName={from.name}
            toName={to.name}
            fromSymbol={from.symbol}
            toSymbol={to.symbol}
          />

          {/* Reverse link */}
          <div className="text-center">
            <a
              href={`/${reverseSlug}`}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Convert {to.code} to {from.code} →
            </a>
          </div>

          {/* SEO Content */}
          <div className="prose prose-indigo max-w-none bg-white rounded-xl p-6 border border-gray-200">
            <h2>
              {from.name} ({from.code}) to {to.name} ({to.code}) Exchange Rate
            </h2>
            <p>
              The {from.code}/{to.code} exchange rate tells you how many {to.name}s
              you can get for one {from.name}. This currency pair tracks the value of
              the {from.country} {from.name.toLowerCase()} against the{" "}
              {to.country} {to.name.toLowerCase()}.
            </p>

            <h3>Understanding {from.code}/{to.code}</h3>
            <p>
              When you see a {from.code}/{to.code} rate, the first currency ({from.code})
              is the base currency and the second ({to.code}) is the quote currency.
              If the {from.code}/{to.code} rate rises, it means the {from.name} is
              strengthening against the {to.name}. If it falls, the {from.name}
              is weakening.
            </p>

            <h3>Factors Affecting {from.code}/{to.code} Rate</h3>
            <ul>
              <li>Interest rate decisions by central banks of {from.country} and {to.country}</li>
              <li>Inflation rates in both economies</li>
              <li>Trade balance between {from.country} and {to.country}</li>
              <li>GDP growth and economic indicators</li>
              <li>Political stability and geopolitical events</li>
              <li>Market sentiment and capital flows</li>
            </ul>

            <h3>How to Convert {from.code} to {to.code}</h3>
            <p>
              Use the converter above to instantly convert any amount from {from.name} to{" "}
              {to.name}. Simply enter the amount in {from.code} and the converter will
              show you the equivalent in {to.code} using the latest exchange rate.
            </p>

            <h3>Frequently Asked Questions</h3>
            <h4>How much is 1 {from.code} in {to.code}?</h4>
            <p>
              Use our live converter above to see the current exchange rate.
              Rates are updated regularly based on forex market data.
            </p>

            <h4>Where can I exchange {from.name} for {to.name}?</h4>
            <p>
              You can exchange currencies at banks, currency exchange services,
              airports, or through online forex platforms. Compare rates to get
              the best deal.
            </p>

            <h4>Is the {from.code}/{to.code} rate the same everywhere?</h4>
            <p>
              No. Banks, exchange services, and brokers may offer different rates
              due to spreads, fees, and markups. The rate shown here is the
              mid-market rate.
            </p>
          </div>

          {/* Related pairs - Internal linking for SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Convert {from.code} to Other Currencies
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {relatedFromPairs.map((p) => (
                  <a
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Convert Other Currencies to {to.code}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {relatedToPairs.map((p) => (
                  <a
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Back to tools */}
          <div className="text-center py-4">
            <Link
              href="/tools"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to All Tools
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

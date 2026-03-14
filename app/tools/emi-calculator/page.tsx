import type { Metadata } from "next";
import EMICalculator from "@/components/tools/EMICalculator";

export const metadata: Metadata = {
  title: "EMI Calculator - Equated Monthly Installment | SphereVista360",
  description:
    "Free EMI calculator. Calculate your monthly loan payment, total interest, and payment breakdown for home loans, car loans, and personal loans.",
  keywords: [
    "EMI calculator",
    "loan EMI",
    "home loan EMI",
    "car loan EMI",
    "monthly installment",
    "loan calculator",
  ],
};

export default function EMICalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EMI Calculator",
    description: metadata.description,
    url: "https://spherevista360.com/tools/emi-calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-main py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">EMI Calculator</h1>
          <p className="mt-3 text-lg text-gray-600">
            Calculate your Equated Monthly Installment for home loans, car
            loans, or personal loans.
          </p>
        </div>

        <EMICalculator />

        <div className="prose prose-indigo max-w-none mt-10">
          <h2>What is EMI?</h2>
          <p>
            EMI (Equated Monthly Installment) is the fixed payment amount a
            borrower makes to a lender on a specified date each month. EMIs
            consist of both principal and interest components.
          </p>
          <h2>EMI Formula</h2>
          <p>
            EMI = P × r × (1 + r)^n / ((1 + r)^n − 1), where P is the
            principal, r is the monthly interest rate, and n is the number of
            monthly installments.
          </p>
        </div>
      </div>
    </>
  );
}

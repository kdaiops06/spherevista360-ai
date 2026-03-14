import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightLeft, Calculator, TrendingUp, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Financial Tools",
  description:
    "Free financial calculators and tools: currency converter, inflation calculator, compound interest calculator, and purchasing power calculator.",
};

const tools = [
  {
    name: "Currency Converter",
    description:
      "Convert between 150+ currencies with real-time exchange rates.",
    href: "/tools/currency-converter",
    icon: ArrowRightLeft,
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Inflation Calculator",
    description:
      "Calculate how inflation erodes purchasing power over time.",
    href: "/tools/inflation-calculator",
    icon: Calculator,
    color: "bg-red-100 text-red-700",
  },
  {
    name: "Compound Interest Calculator",
    description:
      "See how your investments grow with the power of compound interest.",
    href: "/tools/compound-interest",
    icon: TrendingUp,
    color: "bg-green-100 text-green-700",
  },
  {
    name: "Purchasing Power Calculator",
    description:
      "Compare the purchasing power of the US dollar across different years.",
    href: "/tools/purchasing-power",
    icon: DollarSign,
    color: "bg-purple-100 text-purple-700",
  },
];

export default function ToolsPage() {
  return (
    <div className="container-main py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Financial Tools</h1>
        <p className="mt-3 text-lg text-gray-600">
          Free, fast, and accurate financial calculators to help you make
          informed decisions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="card group flex items-start gap-4 transition-all hover:border-brand-200 hover:shadow-lg"
          >
            <div
              className={`rounded-xl p-3 ${tool.color} transition-transform group-hover:scale-110`}
            >
              <tool.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600">
                {tool.name}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRightLeft, Calculator, TrendingUp, DollarSign } from "lucide-react";

const tools = [
  {
    name: "Currency Converter",
    href: "/tools/currency-converter",
    icon: ArrowRightLeft,
    color: "text-blue-600 bg-blue-50",
  },
  {
    name: "Inflation Calculator",
    href: "/tools/inflation-calculator",
    icon: Calculator,
    color: "text-red-600 bg-red-50",
  },
  {
    name: "Compound Interest",
    href: "/tools/compound-interest",
    icon: TrendingUp,
    color: "text-green-600 bg-green-50",
  },
  {
    name: "Purchasing Power",
    href: "/tools/purchasing-power",
    icon: DollarSign,
    color: "text-purple-600 bg-purple-50",
  },
];

export function ToolsGrid() {
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Finance Tools</h2>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center transition-all hover:border-brand-200 hover:shadow-sm"
          >
            <div className={`rounded-lg p-2.5 ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {tool.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRightLeft, Calculator, TrendingUp, DollarSign, BarChart3, Globe, AlertTriangle, TrendingDown, Coins, Brain, Shield } from "lucide-react";

const tools = [
  { name: "Currency Converter", href: "/tools/currency-converter", icon: ArrowRightLeft, color: "text-blue-600 bg-blue-50" },
  { name: "SIP Calculator", href: "/tools/sip-calculator", icon: Calculator, color: "text-indigo-600 bg-indigo-50" },
  { name: "Compound Interest", href: "/tools/compound-interest", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  { name: "Investment Return", href: "/tools/investment-return", icon: BarChart3, color: "text-teal-600 bg-teal-50" },
  { name: "Inflation Calculator", href: "/tools/inflation-calculator", icon: Calculator, color: "text-red-600 bg-red-50" },
  { name: "Purchasing Power", href: "/tools/purchasing-power", icon: DollarSign, color: "text-purple-600 bg-purple-50" },
  { name: "Currency Strength", href: "/tools/currency-strength", icon: Globe, color: "text-cyan-600 bg-cyan-50" },
  { name: "Recession Tracker", href: "/tools/recession-tracker", icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50" },
  { name: "Currency Crisis", href: "/tools/currency-crisis", icon: TrendingDown, color: "text-orange-600 bg-orange-50" },
  { name: "Gold vs Dollar", href: "/tools/gold-vs-dollar", icon: Coins, color: "text-amber-600 bg-amber-50" },
  { name: "FX Forecast", href: "/tools/currency-forecast", icon: Brain, color: "text-violet-600 bg-violet-50" },
  { name: "Stress Index", href: "/tools/global-stress-index", icon: AlertTriangle, color: "text-rose-600 bg-rose-50" },
  { name: "Portfolio Risk", href: "/tools/portfolio-risk-scanner", icon: Shield, color: "text-emerald-600 bg-emerald-50" },
  { name: "Crisis Detector", href: "/tools/currency-crisis-detector", icon: TrendingDown, color: "text-red-600 bg-red-50" },
];

export function ToolsGrid() {
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Finance Tools</h2>
      <div className="grid grid-cols-2 gap-2">
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

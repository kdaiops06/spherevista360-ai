import Link from "next/link";
import { Globe } from "lucide-react";

const footerLinks = {
  Platform: [
    { name: "News", href: "/news" },
    { name: "Currencies", href: "/currencies" },
    { name: "Predictions", href: "/predictions" },
    { name: "Premium", href: "/premium" },
    { name: "Dashboard", href: "/dashboard" },
  ],
  Tools: [
    { name: "Currency Converter", href: "/tools/currency-converter" },
    { name: "Inflation Calculator", href: "/tools/inflation-calculator" },
    { name: "Compound Interest", href: "/tools/compound-interest" },
    { name: "Purchasing Power", href: "/tools/purchasing-power" },
    { name: "Currency Forecast", href: "/tools/currency-forecast" },
  ],
  Resources: [
    { name: "About", href: "/about" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0B0F]">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/35 bg-blue-500/15">
                <Globe className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-lg font-medium text-slate-100">
                SphereVista360
              </span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Macro-financial intelligence platform for market observability,
              economic monitoring, and institutional-style daily briefings.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                {category}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-slate-100"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SphereVista360. All rights
            reserved. Financial data is for informational purposes only.
          </p>
          <div className="mt-2 text-center text-sm text-slate-500">
            Questions or feedback?
            <a href="mailto:contact@spherevista360.com" className="ml-1 underline text-slate-300">
              contact@spherevista360.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

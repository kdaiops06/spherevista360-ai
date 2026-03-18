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
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                SphereVista360
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              AI-powered financial intelligence platform delivering real-time
              market insights, currency analytics, and economic predictions.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900">
                {category}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-brand-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SphereVista360. All rights
            reserved. Financial data is for informational purposes only.
          </p>
          <div className="text-center text-sm text-gray-500 mt-2">
            Questions or feedback? We&apos;d love to hear from you →
            <a href="mailto:contact@spherevista360.com" className="underline ml-1">
              contact@spherevista360.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

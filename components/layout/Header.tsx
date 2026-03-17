"use client";

import Link from "next/link";
import { useState } from "react";
import {
  TrendingUp,
  Globe,
  Brain,
  Wrench,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "News", href: "/news", icon: TrendingUp },
  { name: "Currencies", href: "/currencies", icon: Globe },
  { name: "Predictions", href: "/predictions", icon: Brain },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Use Cases", href: "/use-cases", icon: Wrench },
  { name: "Premium", href: "/premium", icon: Brain },
  { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-main">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Sphere<span className="text-brand-600">Vista</span>360
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav className="border-t border-gray-200 py-4 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

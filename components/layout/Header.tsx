"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Globe,
  Brain,
  Wrench,
  Activity,
  Newspaper,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Markets", href: "/currencies", icon: Globe },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Briefings", href: "/predictions", icon: Brain },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Watchlist AI", href: "/dashboard/watchlist-ai", icon: Brain },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0B0F]/92 backdrop-blur supports-[backdrop-filter]:bg-[#0A0B0F]/78">
      <div className="container-main">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/35 bg-blue-500/15">
              <Globe className="h-5 w-5 text-blue-300" />
            </div>
            <span className="text-lg font-medium tracking-tight text-slate-100 md:text-xl">
              Sphere<span className="text-blue-400">Vista</span>360
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav className="border-t border-white/10 py-4 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
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

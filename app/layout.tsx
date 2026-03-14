import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://spherevista360.com"
  ),
  title: {
    default: "SphereVista360 - AI-Powered Financial Intelligence",
    template: "%s | SphereVista360",
  },
  description:
    "AI-powered financial intelligence platform featuring market analytics, currency insights, economic predictions, and interactive financial tools.",
  keywords: [
    "financial intelligence",
    "AI finance",
    "market analytics",
    "currency converter",
    "economic predictions",
    "stock market",
    "inflation calculator",
    "compound interest",
  ],
  authors: [{ name: "SphereVista360" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://spherevista360.com",
    siteName: "SphereVista360",
    title: "SphereVista360 - AI-Powered Financial Intelligence",
    description:
      "AI-powered financial intelligence platform featuring market analytics, currency insights, economic predictions, and interactive financial tools.",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "SphereVista360",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SphereVista360 - AI-Powered Financial Intelligence",
    description:
      "AI-powered financial intelligence platform featuring market analytics, currency insights, economic predictions, and interactive financial tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://spherevista360.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

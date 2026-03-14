import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SphereVista360 privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-main py-12">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1>Privacy Policy</h1>
        <p className="lead">
          Last updated: March 13, 2026
        </p>

        <h2>Information We Collect</h2>
        <p>
          SphereVista360 collects minimal information necessary to provide our
          services. This may include email addresses provided voluntarily
          through our newsletter signup.
        </p>

        <h2>How We Use Information</h2>
        <ul>
          <li>To deliver newsletter content you subscribe to</li>
          <li>To improve our platform and user experience</li>
          <li>To respond to inquiries submitted through our contact form</li>
        </ul>

        <h2>Data Sources</h2>
        <p>
          Financial data displayed on SphereVista360 is sourced from third-party
          providers including Alpha Vantage, ExchangeRate API, FRED, and News
          API. We do not store personal financial information.
        </p>

        <h2>Cookies</h2>
        <p>
          We use essential cookies to ensure proper functioning of the website.
          No tracking or advertising cookies are used.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, contact us at{" "}
          <a href="mailto:contact@spherevista360.com">contact@spherevista360.com</a>.
        </p>
      </div>
    </div>
  );
}

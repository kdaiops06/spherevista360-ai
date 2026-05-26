import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Risk Analyzer Use Cases",
  description:
    "Learn how to analyze portfolio risk, detect concentration issues, and improve diversification with SphereVista360.",
};

export default function UseCasesPage() {
  return (
    <main className="container-main py-12">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-medium tracking-tight text-slate-100 md:text-4xl">
          Understand Portfolio Risk in Minutes
        </h1>
        <p className="mt-4 text-base text-slate-300 md:text-lg">
          Analyze concentration risk, identify exposure clusters, and generate
          practical portfolio actions with institutional clarity.
        </p>
        <Link
          href="/portfolio-analyzer"
          className="btn-primary mt-6 inline-flex px-6 py-3"
        >
          Analyze Portfolio
        </Link>
        <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
          No signup required
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="text-center text-xl font-medium text-slate-100">
          How It Works
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Add Assets", "Enter stocks, ETFs, crypto, or custom positions."],
            ["02", "Run Analysis", "Get concentration score and exposure diagnostics."],
            ["03", "Act with Context", "Review mitigation ideas and rebalance options."],
          ].map(([step, title, description]) => (
            <div key={step} className="card p-5 text-center">
              <p className="text-sm font-medium tracking-wider text-blue-400">{step}</p>
              <h3 className="mt-2 text-base font-medium text-slate-100">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-xl font-medium text-slate-100">
          Example: Hidden Concentration Risk
        </h2>
        <div className="card mt-5 p-5">
          <p className="text-sm font-medium text-slate-200">Portfolio Snapshot</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            <li>AAPL - 80%</li>
            <li>TSLA - 20%</li>
          </ul>
          <p className="mt-5 text-sm font-medium text-slate-200">Analyzer Output</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li>High single-asset concentration in AAPL</li>
            <li>Elevated downside risk in a correlated drawdown</li>
            <li>Low diversification resilience score</li>
          </ul>
          <p className="mt-4 text-sm text-slate-400">
            This portfolio is highly exposed to one equity shock and lacks
            adequate diversification.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-xl font-medium text-slate-100">
          Who This Is For
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-300">
          <li>Investors tracking concentration risk across fewer holdings</li>
          <li>Operators building disciplined portfolio review habits</li>
          <li>Teams needing fast, explainable risk diagnostics</li>
        </ul>
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        <div className="card p-6 text-center">
          <h2 className="text-2xl font-medium text-slate-100">
            Start Analyzing Your Portfolio Today
          </h2>
          <p className="mt-3 text-slate-300">
            Get immediate risk signals and more disciplined allocation insights.
          </p>
          <Link href="/portfolio-analyzer" className="btn-primary mt-5 inline-flex px-6 py-3">
            Try Portfolio Analyzer
          </Link>
          <p className="mt-5 text-sm text-slate-400">
            Questions or feedback?
            <a href="mailto:contact@spherevista360.com" className="ml-1 text-blue-400 hover:underline">
              contact@spherevista360.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

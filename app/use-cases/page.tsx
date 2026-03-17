import Link from 'next/link';
import Head from 'next/head';

export default function UseCasesPage() {
  return (
    <>
      <Head>
        <title>Portfolio Risk Analyzer Use Cases | SphereVista360</title>
        <meta name="description" content="Learn how to analyze your portfolio risk, detect concentration issues, and improve diversification using SphereVista360." />
      </Head>
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* HERO SECTION */}
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Understand Your Portfolio Risk in Seconds</h1>
          <p className="text-lg text-gray-600 mb-6">Get instant insights into your investments, detect concentration risks, and make smarter decisions.</p>
          <Link href="/portfolio-analyzer">
            <a className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-2">Analyze Your Portfolio →</a>
          </Link>
          <div className="text-xs text-gray-400 mt-2">No signup required</div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-blue-600 text-2xl mb-2">1</div>
              <div className="font-bold mb-1">Add Your Assets</div>
              <div className="text-gray-500 text-sm">Enter stocks, crypto, or other investments</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-blue-600 text-2xl mb-2">2</div>
              <div className="font-bold mb-1">Instant Analysis</div>
              <div className="text-gray-500 text-sm">Get risk score, allocation breakdown, and insights</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-blue-600 text-2xl mb-2">3</div>
              <div className="font-bold mb-1">Take Action</div>
              <div className="text-gray-500 text-sm">Understand risks and improve diversification</div>
            </div>
          </div>
        </section>

        {/* REAL USE CASE */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-center">Example: Detecting Hidden Risk</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="mb-2 font-semibold">Portfolio:</div>
            <ul className="mb-2 text-sm">
              <li>AAPL — 80%</li>
              <li>TSLA — 20%</li>
            </ul>
            <div className="mb-2 font-semibold">Analysis Output:</div>
            <ul className="mb-2 text-sm">
              <li>⚠️ High concentration in AAPL</li>
              <li>📉 Potential downside risk highlighted</li>
              <li>📊 Lack of diversification detected</li>
            </ul>
            <div className="text-gray-600 text-sm mt-2">This portfolio is highly exposed to a single stock, increasing overall risk.</div>
          </div>
        </section>

        {/* WHO THIS IS FOR */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-center">Who This Is For</h2>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            <li>Beginner investors unsure about portfolio risk</li>
            <li>Individuals with a few concentrated holdings</li>
            <li>Anyone looking for quick and clear investment insights</li>
          </ul>
        </section>

        {/* WHY SPHEREVISTA360 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-center">Why Use SphereVista360?</h2>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            <li>Instant portfolio analysis (no signup required)</li>
            <li>Clear and actionable insights</li>
            <li>Detect concentration and diversification risks</li>
            <li>Simple, fast, and easy to use</li>
          </ul>
        </section>

        {/* FINAL CTA */}
        <section className="text-center mt-10">
          <h2 className="text-2xl font-bold mb-2">Start Analyzing Your Portfolio Today</h2>
          <p className="text-gray-600 mb-6">Get instant insights and improve your investment decisions.</p>
          <Link href="/portfolio-analyzer">
            <a className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">Try Portfolio Analyzer →</a>
          </Link>
        </section>
      </main>
    </>
  );
}

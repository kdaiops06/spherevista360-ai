import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Financial News & Analysis",
  description:
    "AI-generated financial news, market analysis, and economic insights. Stay informed with daily articles powered by artificial intelligence.",
};

export default function NewsPage() {
  const articles = getAllArticles();

  return (
    <div className="container-main py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Financial News & Analysis
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          AI-generated insights covering markets, currencies, and macroeconomics
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-lg font-medium text-gray-500">
            No articles published yet
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Articles will appear here once AI agents begin publishing content.
            Run <code className="rounded bg-gray-100 px-1.5 py-0.5">npm run auto-publish</code> to
            generate your first articles.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/news/${article.slug}`}
              className="card group transition-all hover:border-brand-200 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="badge-blue">{article.category}</span>
                <span className="text-xs text-gray-400">
                  {article.readingTime} min read
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 line-clamp-2">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                {article.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>{article.author}</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

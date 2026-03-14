import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getAllArticles } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { seoAgent } from "@/agents/seo-agent";
import { AdBanner } from "@/components/monetization/AdBanner";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Try all categories
  for (const category of ["finance", "macro", "currencies"]) {
    const article = getArticle(category, slug);
    if (article) {
      return {
        title: article.seo.title || article.title,
        description: article.seo.description || article.description,
        keywords: article.seo.keywords,
        openGraph: {
          title: article.title,
          description: article.description,
          type: "article",
          publishedTime: article.publishedAt,
          authors: [article.author],
          tags: article.tags,
        },
      };
    }
  }
  return { title: "Article Not Found" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article = null;
  for (const category of ["finance", "macro", "currencies"]) {
    article = getArticle(category, slug);
    if (article) break;
  }

  if (!article) notFound();

  const schema = seoAgent.generateArticleSchema(article);

  return (
    <article className="container-main py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-blue">{article.category}</span>
            <span className="text-sm text-gray-400">
              {article.readingTime} min read
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{article.description}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
            <span>By {article.author}</span>
            <span>·</span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
        </header>

        <AdBanner slot="article-top" className="mb-8" />

        {/* Content */}
        <div className="prose-article">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <AdBanner slot="article-bottom" className="mt-8" />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="badge bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </article>
  );
}

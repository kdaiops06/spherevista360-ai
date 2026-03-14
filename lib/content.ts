import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Article } from "@/types";
import { estimateReadingTime } from "@/lib/utils";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getArticlesByCategory(category: string): Article[] {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title || "",
        description: data.description || "",
        content,
        category: category as Article["category"],
        tags: data.tags || [],
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        author: data.author || "AI Agent",
        readingTime: estimateReadingTime(content),
        featured: data.featured || false,
        seo: {
          title: data.seoTitle || data.title || "",
          description: data.seoDescription || data.description || "",
          keywords: data.keywords || [],
          ogImage: data.ogImage,
        },
      } satisfies Article;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getArticle(
  category: string,
  slug: string
): Article | null {
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    content,
    category: category as Article["category"],
    tags: data.tags || [],
    publishedAt: data.publishedAt || new Date().toISOString(),
    updatedAt: data.updatedAt,
    author: data.author || "AI Agent",
    readingTime: estimateReadingTime(content),
    featured: data.featured || false,
    seo: {
      title: data.seoTitle || data.title || "",
      description: data.seoDescription || data.description || "",
      keywords: data.keywords || [],
      ogImage: data.ogImage,
    },
  };
}

export function getAllArticles(): Article[] {
  const categories = ["finance", "macro", "currencies"];
  return categories
    .flatMap((cat) => getArticlesByCategory(cat))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function saveArticleAsMDX(article: {
  slug: string;
  category: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  keywords: string[];
  author?: string;
}): string {
  const dir = path.join(CONTENT_DIR, article.category);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const frontmatter = {
    title: article.title,
    description: article.description,
    publishedAt: new Date().toISOString(),
    author: article.author || "AI Agent",
    tags: article.tags,
    keywords: article.keywords,
    featured: false,
    seoTitle: article.title,
    seoDescription: article.description,
  };

  const mdxContent = matter.stringify(article.content, frontmatter);
  const filePath = path.join(dir, `${article.slug}.mdx`);
  fs.writeFileSync(filePath, mdxContent, "utf-8");

  return filePath;
}

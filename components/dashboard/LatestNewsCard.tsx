import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import type { NewsItem } from "@/types";
import { ExternalLink } from "lucide-react";

interface LatestNewsCardProps {
  news: NewsItem[];
  isLive?: boolean;
  source?: string;
  lastUpdated?: string;
}

export function LatestNewsCard({ news, isLive = false, source, lastUpdated }: LatestNewsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
        <div className="flex items-center gap-3">
          <DataSourceBadge isLive={isLive} source={source} lastUpdated={lastUpdated} />
          <Link
            href="/news"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all →
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {news.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

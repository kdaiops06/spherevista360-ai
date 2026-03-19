"use client";
import { useState, useEffect } from "react";
import { LatestNewsCard } from "@/components/dashboard/LatestNewsCard";

import type { NewsItem } from "@/types";

interface NewsRealtimeWrapperProps {
  initialNews?: NewsItem[];
  initialIsLive?: boolean;
  initialSource?: string;
  initialLastUpdated?: string;
}

export default function NewsRealtimeWrapper({ initialNews = [], initialIsLive, initialSource, initialLastUpdated }: NewsRealtimeWrapperProps) {
  const [news, setNews] = useState(initialNews || []);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(initialLastUpdated ? new Date(initialLastUpdated) : null);

  async function fetchNews() {
    setLoading(true);
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const data = await res.json();
      setNews(data.articles || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch news");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    return `${Math.floor(seconds / 3600)} hr ago`;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={fetchNews}
          disabled={loading}
          className="px-3 py-1 text-xs rounded bg-brand-100 text-brand-700 border border-brand-200 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
        {lastUpdated && (
          <span className="text-xs text-gray-500">Updated {timeAgo(lastUpdated)}</span>
        )}
      </div>
      <LatestNewsCard news={news} />
    </div>
  );
}

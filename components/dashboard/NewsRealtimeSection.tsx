"use client";
import dynamic from "next/dynamic";
const NewsRealtimeWrapper = dynamic(() => import("@/components/dashboard/NewsRealtimeWrapper"));

interface NewsRealtimeSectionProps {
  initialNews?: any[];
  initialIsLive?: boolean;
  initialSource?: string;
  initialLastUpdated?: string;
}

export default function NewsRealtimeSection(props: NewsRealtimeSectionProps) {
  return <NewsRealtimeWrapper {...props} />;
}
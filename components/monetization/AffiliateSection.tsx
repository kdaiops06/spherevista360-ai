import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  category: string;
}

interface AffiliateSectionProps {
  links: AffiliateLink[];
  title?: string;
}

export function AffiliateSection({
  links,
  title = "Recommended Resources",
}: AffiliateSectionProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{link.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
              <span className="text-xs text-gray-400 mt-1 inline-block">
                {link.category}
              </span>
            </div>
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Some links may be affiliate links. See our disclosure policy.
      </p>
    </div>
  );
}

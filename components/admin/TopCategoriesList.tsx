'use client';

import Link from 'next/link';
import { FolderOpen, FileText, Eye, ExternalLink } from 'lucide-react';

interface TopCategory {
  id: string;
  name: string;
  postCount: number;
  totalViews: number;
}

interface TopCategoriesListProps {
  categories: TopCategory[];
  title?: string;
}

export function TopCategoriesList({ 
  categories, 
  title = "Top Categories" 
}: TopCategoriesListProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getAverageViews = (category: TopCategory) => {
    return category.postCount > 0 ? Math.round(category.totalViews / category.postCount) : 0;
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-text-secondary">
          No categories available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <Link
          href="/admin/categories"
          className="text-sm text-accent-cyan hover:underline flex items-center gap-1"
        >
          Manage
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="flex items-center gap-3 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
              <span className="text-sm font-bold text-accent-purple">
                {index + 1}
              </span>
            </div>

            {/* Category icon and name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FolderOpen size={18} className="text-accent-purple flex-shrink-0" />
              <div className="min-w-0">
                <Link
                  href={`/blog?category=${category.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h4 className="font-medium text-sm truncate hover:text-accent-cyan transition-colors">
                    {category.name}
                  </h4>
                </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1" title="Posts">
                <FileText size={16} />
                <span className="font-semibold">
                  {formatNumber(category.postCount)}
                </span>
              </div>
              <div className="flex items-center gap-1" title="Total Views">
                <Eye size={16} />
                <span className="font-semibold text-accent-cyan">
                  {formatNumber(category.totalViews)}
                </span>
              </div>
            </div>

            {/* External link */}
            <Link
              href={`/blog?category=${category.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-2 text-text-secondary hover:text-accent-cyan transition-colors"
              title="View category"
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-secondary-light">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-text-secondary">Total Posts</p>
            <p className="font-semibold text-accent-purple">
              {formatNumber(categories.reduce((sum, cat) => sum + cat.postCount, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Total Views</p>
            <p className="font-semibold text-accent-cyan">
              {formatNumber(categories.reduce((sum, cat) => sum + cat.totalViews, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Avg Views/Post</p>
            <p className="font-semibold">
              {formatNumber(
                categories.length > 0
                  ? Math.round(
                      categories.reduce((sum, cat) => sum + getAverageViews(cat), 0) /
                        categories.length
                    )
                  : 0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
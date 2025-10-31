'use client';

import Link from 'next/link';
import { Eye, MessageSquare, ExternalLink } from 'lucide-react';

interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  comments: number;
}

interface TopPostsListProps {
  posts: TopPost[];
  title: string;
  sortBy: 'views' | 'comments';
}

export function TopPostsList({ posts, title, sortBy }: TopPostsListProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMetricValue = (post: TopPost) => {
    return sortBy === 'views' ? post.views : post.comments;
  };

  const getMetricIcon = () => {
    return sortBy === 'views' ? Eye : MessageSquare;
  };

  const MetricIcon = getMetricIcon();

  if (!posts || posts.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-text-secondary">
          No posts available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <Link
          href="/admin/posts"
          className="text-sm text-accent-cyan hover:underline flex items-center gap-1"
        >
          View All
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="flex items-center gap-3 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <span className="text-sm font-bold text-accent-cyan">
                {index + 1}
              </span>
            </div>

            {/* Post info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h4 className="font-medium text-sm line-clamp-2 hover:text-accent-cyan transition-colors">
                  {post.title}
                </h4>
              </Link>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              {sortBy === 'views' ? (
                <>
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span className="font-semibold text-accent-cyan">
                      {formatNumber(post.views)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    <span>{formatNumber(post.comments)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    <span className="font-semibold text-accent-cyan">
                      {formatNumber(post.comments)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{formatNumber(post.views)}</span>
                  </div>
                </>
              )}
            </div>

            {/* External link */}
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-2 text-text-secondary hover:text-accent-cyan transition-colors"
              title="View post"
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-secondary-light">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-text-secondary">Total Views</p>
            <p className="font-semibold text-accent-purple">
              {formatNumber(posts.reduce((sum, post) => sum + post.views, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Total Comments</p>
            <p className="font-semibold text-accent-cyan">
              {formatNumber(posts.reduce((sum, post) => sum + post.comments, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
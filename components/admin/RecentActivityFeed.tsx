'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Mail, User, ExternalLink } from 'lucide-react';

interface RecentComment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: { name: string };
  post: { title: string; slug: string };
}

interface RecentSubscriber {
  id: string;
  email: string;
  createdAt: Date | string;
}

interface RecentActivityFeedProps {
  comments: RecentComment[];
  subscribers: RecentSubscriber[];
  title?: string;
}

export function RecentActivityFeed({
  comments,
  subscribers,
  title = "Recent Activity"
}: RecentActivityFeedProps) {
  // Combine and sort activities by date
  const activities = [
    ...comments.map(comment => ({
      id: `comment-${comment.id}`,
      type: 'comment' as const,
      createdAt: typeof comment.createdAt === 'string' 
        ? new Date(comment.createdAt) 
        : comment.createdAt,
      data: comment,
    })),
    ...subscribers.map(subscriber => ({
      id: `subscriber-${subscriber.id}`,
      type: 'subscriber' as const,
      createdAt: typeof subscriber.createdAt === 'string' 
        ? new Date(subscriber.createdAt) 
        : subscriber.createdAt,
      data: subscriber,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.slice(0, 2)}***@${domain}`;
  };

  if (activities.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-text-secondary">
          No recent activity
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/comments"
            className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
          >
            Comments
            <ExternalLink size={12} />
          </Link>
          <span className="text-text-secondary">•</span>
          <Link
            href="/admin/subscribers"
            className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
          >
            Subscribers
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.slice(0, 10).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {activity.type === 'comment' ? (
                <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                  <MessageSquare size={16} className="text-accent-cyan" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                  <Mail size={16} className="text-accent-purple" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {activity.type === 'comment' ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-text-secondary" />
                    <span className="font-medium text-sm">
                      {(activity.data as RecentComment).user.name}
                    </span>
                    <span className="text-text-secondary text-xs">commented on</span>
                    <Link
                      href={`/blog/${(activity.data as RecentComment).post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:underline text-sm font-medium truncate"
                    >
                      {(activity.data as RecentComment).post.title}
                    </Link>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">
                    "{truncateText((activity.data as RecentComment).content)}"
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={14} className="text-text-secondary" />
                    <span className="font-medium text-sm">New subscriber</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">
                    {maskEmail((activity.data as RecentSubscriber).email)}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs text-text-secondary">
                {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
              </p>
            </div>

            {/* Action */}
            {activity.type === 'comment' && (
              <Link
                href={`/admin/comments`}
                className="flex-shrink-0 p-2 text-text-secondary hover:text-accent-cyan transition-colors"
                title="Moderate comment"
              >
                <ExternalLink size={14} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {activities.length > 10 && (
        <div className="mt-4 pt-4 border-t border-secondary-light text-center">
          <p className="text-sm text-text-secondary">
            Showing 10 of {activities.length} recent activities
          </p>
        </div>
      )}
    </div>
  );
}
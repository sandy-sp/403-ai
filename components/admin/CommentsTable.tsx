'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Trash2, AlertTriangle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'SPAM';
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

interface CommentsTableProps {
  initialComments: Comment[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

export function CommentsTable({
  initialComments,
  initialTotal,
  initialPage,
  initialTotalPages,
}: CommentsTableProps) {
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'SPAM'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const filteredComments = comments.filter((c) =>
    filter === 'all' ? true : c.status === filter
  );

  const handleAction = async (
    commentId: string,
    action: 'approve' | 'spam' | 'delete'
  ) => {
    setIsLoading(true);

    try {
      const endpoint =
        action === 'delete'
          ? `/api/admin/comments/${commentId}`
          : `/api/admin/comments/${commentId}/${action}`;

      const method = action === 'delete' ? 'DELETE' : 'POST';

      const res = await fetch(endpoint, { method });

      if (!res.ok) {
        throw new Error(`Failed to ${action} comment`);
      }

      if (action === 'delete') {
        setComments(comments.filter((c) => c.id !== commentId));
        toast.success('Comment deleted successfully');
      } else {
        toast.success(
          `Comment ${action === 'approve' ? 'approved' : 'marked as spam'} successfully`
        );
        router.refresh();
      }
    } catch (error: any) {
      console.error(`Failed to ${action} comment:`, error);
      toast.error(error.message || `Failed to ${action} comment`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-status-success/20 text-status-success',
      SPAM: 'bg-status-error/20 text-status-error',
      PENDING: 'bg-status-warning/20 text-status-warning',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}
      >
        {status}
      </span>
    );
  };

  const stats = {
    all: comments.length,
    PENDING: comments.filter((c) => c.status === 'PENDING').length,
    APPROVED: comments.filter((c) => c.status === 'APPROVED').length,
    SPAM: comments.filter((c) => c.status === 'SPAM').length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.all}</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-status-warning">{stats.PENDING}</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Approved</p>
          <p className="text-2xl font-bold text-status-success">{stats.APPROVED}</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Spam</p>
          <p className="text-2xl font-bold text-status-error">{stats.SPAM}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'PENDING', 'APPROVED', 'SPAM'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === f
                ? 'bg-accent-cyan text-primary'
                : 'bg-secondary-light text-text-primary hover:bg-secondary'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== 'all' && ` (${stats[f]})`}
          </button>
        ))}
      </div>

      {/* Comments table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-light">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">Author</th>
                <th className="p-4 text-left text-sm font-semibold">Content</th>
                <th className="p-4 text-left text-sm font-semibold">Post</th>
                <th className="p-4 text-left text-sm font-semibold">Date</th>
                <th className="p-4 text-left text-sm font-semibold">Status</th>
                <th className="p-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    No comments found
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => {
                  const createdAt =
                    typeof comment.createdAt === 'string'
                      ? new Date(comment.createdAt)
                      : comment.createdAt;

                  return (
                    <tr
                      key={comment.id}
                      className="border-t border-secondary hover:bg-secondary-light/50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{comment.user.name}</p>
                          <p className="text-xs text-text-secondary">
                            {comment.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="text-sm line-clamp-2">{comment.content}</p>
                      </td>
                      <td className="p-4">
                        <a
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent-cyan hover:underline"
                        >
                          {comment.post.title}
                        </a>
                      </td>
                      <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </td>
                      <td className="p-4">{getStatusBadge(comment.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {comment.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleAction(comment.id, 'approve')}
                              disabled={isLoading}
                              className="p-2 bg-status-success/20 text-status-success rounded-lg hover:bg-status-success/30 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {comment.status !== 'SPAM' && (
                            <button
                              onClick={() => handleAction(comment.id, 'spam')}
                              disabled={isLoading}
                              className="p-2 bg-status-warning/20 text-status-warning rounded-lg hover:bg-status-warning/30 transition-colors disabled:opacity-50"
                              title="Mark as Spam"
                            >
                              <AlertTriangle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(comment.id, 'delete')}
                            disabled={isLoading}
                            className="p-2 bg-status-error/20 text-status-error rounded-lg hover:bg-status-error/30 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

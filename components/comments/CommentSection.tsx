'use client';

import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  isAuthenticated: boolean;
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
  isAuthenticated,
}: CommentSectionProps) {
  const router = useRouter();

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error('Failed to update comment');
      }

      toast.success('Comment updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }

      toast.success('Comment deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <section className="mt-12 border-t border-secondary-light pt-12">
      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="mb-8">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <div className="mb-8 p-6 bg-secondary-light rounded-lg border border-secondary text-center">
          <p className="text-text-secondary mb-4">
            Please sign in to leave a comment
          </p>
          <Link
            href="/signin"
            className="inline-block px-6 py-3 bg-accent-cyan text-primary rounded-lg font-semibold hover:bg-accent-cyan/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-accent-cyan" />
          <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-12 bg-secondary-light rounded-lg border border-secondary">
            <MessageSquare
              size={48}
              className="mx-auto mb-4 text-text-secondary"
            />
            <p className="text-text-secondary">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

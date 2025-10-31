import { CommentCard } from './CommentCard';
import { getSession } from '@/lib/auth';
import { MessageSquare } from 'lucide-react';

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

interface CommentListProps {
  postId: string;
}

async function getComments(postId: string): Promise<Comment[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/posts/${postId}/comments`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch comments');
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function CommentList({ postId }: CommentListProps) {
  const [comments, session] = await Promise.all([
    getComments(postId),
    getSession(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare size={24} className="text-accent-cyan" />
        <h3 className="text-2xl font-bold">
          Comments ({comments.length})
        </h3>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 bg-secondary-light rounded-lg border border-secondary">
          <MessageSquare size={48} className="mx-auto mb-4 text-text-secondary" />
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
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

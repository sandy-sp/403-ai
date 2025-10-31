'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to post comment');
      }

      setContent('');
      toast.success('Comment submitted! It will appear after approval.');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-semibold mb-2">
          Leave a Comment
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 bg-secondary-light border border-secondary rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-cyan resize-none"
          rows={4}
          maxLength={1000}
          required
        />
        <p className="text-xs text-text-secondary mt-1">
          {content.length}/1000 characters
        </p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-primary rounded-lg font-semibold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}

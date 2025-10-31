import { CommentsTable } from '@/components/admin/CommentsTable';
import { requireAdmin } from '@/lib/auth';
import { CommentService } from '@/lib/services/comment.service';
import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Comment Moderation - Admin',
  description: 'Moderate and manage blog comments',
};

export default async function AdminCommentsPage() {
  await requireAdmin();

  const result = await CommentService.getAllComments({
    page: 1,
    limit: 100,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={32} className="text-accent-cyan" />
        <div>
          <h1 className="text-3xl font-bold">Comment Moderation</h1>
          <p className="text-text-secondary">
            Review and moderate user comments
          </p>
        </div>
      </div>

      <CommentsTable
        initialComments={result.comments}
        initialTotal={result.total}
        initialPage={result.page}
        initialTotalPages={result.totalPages}
      />
    </div>
  );
}

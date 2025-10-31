'use client';

import { formatDistanceToNow } from 'date-fns';
import { User, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentCard({
  comment,
  currentUserId,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.user.id;
  const createdAt =
    typeof comment.createdAt === 'string'
      ? new Date(comment.createdAt)
      : comment.createdAt;

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
      setIsDeleting(true);
      await onDelete(comment.id);
    }
  };

  return (
    <div className="bg-secondary-light rounded-lg p-4 border border-secondary">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {comment.user.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt={comment.user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-accent-cyan" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <p className="font-semibold text-text-primary">
                {comment.user.name}
              </p>
              <p className="text-xs text-text-secondary">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
            </div>

            {/* Actions */}
            {isOwner && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-text-secondary hover:text-accent-cyan transition-colors"
                  title="Edit comment"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 text-text-secondary hover:text-status-error transition-colors disabled:opacity-50"
                  title="Delete comment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-primary border border-secondary rounded-lg text-text-primary focus:outline-none focus:border-accent-cyan resize-none"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-accent-cyan text-primary rounded-lg font-semibold hover:bg-accent-cyan/90 transition-colors text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-4 py-2 bg-secondary rounded-lg text-text-primary hover:bg-secondary-light transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-text-primary whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

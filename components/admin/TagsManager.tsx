'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tags?withCount=true');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }

      toast.success('Tag created successfully');
      setNewTagName('');
      fetchTags();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Tag deleted successfully');
      fetchTags();
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary-light rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tags List */}
      <div className="lg:col-span-2">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">All Tags ({tags.length})</h2>

          {tags.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <TagIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p>No tags yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-light rounded-full group"
                >
                  <span className="font-medium">{tag.name}</span>
                  <span className="text-xs text-text-secondary">
                    ({tag._count?.posts || 0})
                  </span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-status-error/20 rounded-full"
                    title="Delete tag"
                  >
                    <X size={14} className="text-status-error" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Tag Form */}
      <div className="lg:col-span-1">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Add New Tag</h2>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Tag Name *</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="input"
                placeholder="e.g., Machine Learning"
                required
                disabled={isAdding}
              />
              <p className="text-xs text-text-secondary mt-1">
                Slug will be auto-generated
              </p>
            </div>

            <button
              type="submit"
              disabled={isAdding || !newTagName.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {isAdding ? 'Adding...' : 'Add Tag'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-secondary-light rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">Quick Tips</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Tags help readers find related content</li>
              <li>• Use specific, descriptive names</li>
              <li>• Tags are automatically removed from posts when deleted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

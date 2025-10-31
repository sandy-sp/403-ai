'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateShort } from '@/lib/utils/date';

interface Post {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
  };
  categories: Array<{
    category: {
      name: string;
    };
  }>;
}

export function PostsTable() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, [search, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    if (!confirm(`Delete ${selectedPosts.size} posts?`)) return;

    try {
      await Promise.all(
        Array.from(selectedPosts).map((id) =>
          fetch(`/api/posts/${id}`, { method: 'DELETE' })
        )
      );

      toast.success('Posts deleted successfully');
      setSelectedPosts(new Set());
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete posts');
    }
  };

  const togglePostSelection = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const toggleAllPosts = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-status-success/20 text-status-success';
      case 'DRAFT':
        return 'bg-status-warning/20 text-status-warning';
      case 'ARCHIVED':
        return 'bg-secondary text-text-secondary';
      default:
        return 'bg-secondary text-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary-light rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {selectedPosts.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="btn-secondary flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete ({selectedPosts.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-light">
              <th className="text-left p-3">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === posts.length && posts.length > 0}
                  onChange={toggleAllPosts}
                  className="w-4 h-4 rounded border-secondary-light bg-secondary text-accent-cyan"
                />
              </th>
              <th className="text-left p-3 font-semibold">Title</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Category</th>
              <th className="text-left p-3 font-semibold">Views</th>
              <th className="text-left p-3 font-semibold">Date</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-text-secondary">
                  No posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-secondary-light hover:bg-secondary-light/50 transition-colors"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => togglePostSelection(post.id)}
                      className="w-4 h-4 rounded border-secondary-light bg-secondary text-accent-cyan"
                    />
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-text-secondary">By {post.author.name}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-text-secondary">
                    {post.categories[0]?.category.name || '-'}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye size={14} className="text-text-secondary" />
                      {post.viewCount}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-secondary">
                    {formatDateShort(post.publishedAt || post.createdAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                        className="p-2 hover:bg-secondary rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} className="text-accent-cyan" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-secondary rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-status-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

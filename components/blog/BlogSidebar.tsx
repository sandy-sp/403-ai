'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FolderOpen, Tag, TrendingUp, Search, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
}

interface BlogSidebarProps {
  categories: Category[];
  tags: Tag[];
  popularPosts: Post[];
}

export function BlogSidebar({ categories, tags, popularPosts }: BlogSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category');
  const selectedTag = searchParams.get('tag');
  const currentSearch = searchParams.get('search');

  const clearAllFilters = () => {
    router.push('/blog');
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {(currentSearch || selectedCategory || selectedTag) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Active Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-accent-cyan hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {currentSearch && (
              <div className="flex items-center gap-2 p-2 bg-accent-cyan/10 rounded-lg">
                <Search size={16} className="text-accent-cyan" />
                <span className="text-sm">Search: "{currentSearch}&quot;</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('search');
                    params.delete('page');
                    router.push(`/blog?${params.toString()}`);
                  }}
                  className="ml-auto text-accent-cyan hover:text-accent-cyan/70"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="flex items-center gap-2 p-2 bg-accent-cyan/10 rounded-lg">
                <FolderOpen size={16} className="text-accent-cyan" />
                <span className="text-sm">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                </span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('category');
                    params.delete('page');
                    router.push(`/blog?${params.toString()}`);
                  }}
                  className="ml-auto text-accent-cyan hover:text-accent-cyan/70"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedTag && (
              <div className="flex items-center gap-2 p-2 bg-accent-cyan/10 rounded-lg">
                <Tag size={16} className="text-accent-cyan" />
                <span className="text-sm">
                  Tag: {tags.find(t => t.id === selectedTag)?.name}
                </span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('tag');
                    params.delete('page');
                    router.push(`/blog?${params.toString()}`);
                  }}
                  className="ml-auto text-accent-cyan hover:text-accent-cyan/70"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={20} className="text-accent-cyan" />
          <h3 className="font-bold text-lg">Categories</h3>
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.id}`}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'hover:bg-secondary-light'
              }`}
            >
              <span>{category.name}</span>
              <span className="text-sm text-text-secondary">
                {category._count?.posts || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Posts */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-accent-purple" />
          <h3 className="font-bold text-lg">Popular Posts</h3>
        </div>
        <div className="space-y-3">
          {popularPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block p-2 rounded-lg hover:bg-secondary-light transition-colors"
            >
              <h4 className="font-medium text-sm mb-1 line-clamp-2">{post.title}</h4>
              <p className="text-xs text-text-secondary">{post.viewCount} views</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={20} className="text-accent-cyan" />
          <h3 className="font-bold text-lg">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.id}`}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === tag.id
                  ? 'bg-accent-cyan text-primary'
                  : 'bg-secondary-light hover:bg-accent-cyan/20 hover:text-accent-cyan'
              }`}
            >
              {tag.name} ({tag._count?.posts || 0})
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FolderOpen, Tag, TrendingUp } from 'lucide-react';

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
  const selectedCategory = searchParams.get('category');
  const selectedTag = searchParams.get('tag');

  return (
    <div className="space-y-6">
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

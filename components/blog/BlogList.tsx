'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDateShort } from '@/lib/utils/date';
import { calculateReadTime } from '@/lib/utils/content';
import { useState } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  content: string;
  author: {
    name: string;
  };
  categories: Array<{
    category: {
      name: string;
    };
  }>;
}

interface BlogListProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export function BlogList({ posts, currentPage, totalPages, total }: BlogListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const currentSearch = searchParams.get('search') || '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  // Function to highlight search terms in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent-cyan/30 text-accent-cyan px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className={`input pl-12 pr-12 w-full ${currentSearch ? 'ring-2 ring-accent-cyan/50' : ''}`}
          />
          {(searchQuery || currentSearch) && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent-cyan transition-colors"
              title="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </form>

      {/* Results Info */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-text-secondary">
          {currentSearch ? (
            <>
              Showing {posts.length} of {total} results for{' '}
              <span className="text-accent-cyan font-semibold">"{currentSearch}"</span>
            </>
          ) : (
            `Showing ${posts.length} of ${total} posts`
          )}
        </div>
        {currentSearch && (
          <button
            onClick={clearSearch}
            className="text-sm text-accent-cyan hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="card text-center py-12">
          {currentSearch ? (
            <div>
              <Search size={48} className="mx-auto mb-4 text-text-secondary" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-text-secondary mb-4">
                No posts found for "{currentSearch}". Try adjusting your search terms.
              </p>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your spelling</li>
                  <li>Try different keywords</li>
                  <li>Use more general terms</li>
                  <li>Browse by categories or tags</li>
                </ul>
              </div>
              <button
                onClick={clearSearch}
                className="mt-6 btn-primary"
              >
                View All Posts
              </button>
            </div>
          ) : (
            <p className="text-text-secondary">No posts found</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card hover:ring-2 hover:ring-accent-cyan transition-all group"
              >
                {post.featuredImageUrl && (
                  <img
                    src={post.featuredImageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                  {post.categories[0] && (
                    <>
                      <span className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan rounded">
                        {post.categories[0].category.name}
                      </span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatDateShort(post.publishedAt!)}</span>
                  <span>·</span>
                  <span>{calculateReadTime(post.content)} min read</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent-cyan transition-colors">
                  {highlightText(post.title, currentSearch)}
                </h2>
                <p className="text-text-secondary mb-4 line-clamp-3">
                  {post.excerpt ? highlightText(post.excerpt, currentSearch) : ''}
                </p>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>By {post.author.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-accent-cyan text-primary font-bold'
                        : 'bg-secondary hover:bg-secondary-light'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

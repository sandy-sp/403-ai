import Link from 'next/link';
import { formatDateShort } from '@/lib/utils/date';
import { calculateReadTime } from '@/lib/utils/content';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  content: string;
}

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
          )}
          <div className="text-xs text-text-secondary mb-2">
            {formatDateShort(post.publishedAt!)} · {calculateReadTime(post.content)} min read
          </div>
          <h3 className="font-bold mb-2 group-hover:text-accent-cyan transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}

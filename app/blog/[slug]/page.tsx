import { PostService } from '@/lib/services/post.service';
import { CommentService } from '@/lib/services/comment.service';
import { notFound } from 'next/navigation';
import { formatDateShort } from '@/lib/utils/date';
import { calculateReadTime } from '@/lib/utils/content';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import { SocialShare } from '@/components/blog/SocialShare';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { CommentSection } from '@/components/comments/CommentSection';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Clock, Eye } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await PostService.getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    keywords: post.focusKeyword || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await PostService.getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment view count
  await PostService.incrementViewCount(post.id);

  // Get related posts, comments, and session in parallel
  const [relatedPosts, comments, session] = await Promise.all([
    PostService.getRelatedPosts(post.id, 3),
    CommentService.getPostComments(post.id, false),
    getSession(),
  ]);

  const readTime = calculateReadTime(post.content);
  const sanitizedContent = sanitizeHtml(post.content);

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-secondary border-b border-secondary-light">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-accent-cyan hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Featured Image */}
        {post.featuredImageUrl && (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        {/* Article Header */}
        <header className="mb-8">
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(({ category }) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.id}`}
                  className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm hover:bg-accent-cyan/30 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-text-secondary">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDateShort(post.publishedAt!)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{post.viewCount} views</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.id}`}
                  className="px-3 py-1 bg-secondary-light rounded-full text-sm hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="border-t border-secondary-light pt-8 mb-12">
          <SocialShare title={post.title} slug={post.slug} />
        </div>

        {/* Author Bio */}
        <div className="card mb-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
              <User size={32} className="text-accent-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">{post.author.name}</h3>
              <p className="text-text-secondary text-sm">
                Content creator and AI researcher exploring the frontiers of artificial intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          comments={comments}
          currentUserId={session?.user?.id}
          isAuthenticated={!!session}
        />
      </article>
    </div>
  );
}

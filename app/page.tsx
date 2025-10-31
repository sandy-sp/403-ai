import Link from 'next/link';
import { PostService } from '@/lib/services/post.service';
import { ArrowRight, BookOpen, MessageSquare, Newspaper } from 'lucide-react';
import { formatDateShort } from '@/lib/utils/date';
import { calculateReadTime } from '@/lib/utils/content';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Home() {
  const { posts } = await PostService.getPublishedPosts({ limit: 6, sortBy: 'publishedAt' });

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent animate-fade-in">
              403 AI
            </h1>
            <p className="text-2xl md:text-3xl text-text-secondary mb-4">Forbidden AI</p>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12">
              A platform dedicated to sharing AI research, conducting discussions,
              publishing AI news, and exploring forbidden knowledge in the AI/ML space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog" className="btn-primary flex items-center justify-center gap-2">
                Explore Research
                <ArrowRight size={18} />
              </Link>
              <Link href="/blog" className="btn-outline flex items-center justify-center gap-2">
                Read Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What is 403 AI?</h2>
            <p className="text-lg text-text-secondary mb-8">
              We believe that true innovation comes from exploring the uncharted territories
              of artificial intelligence. Our mission is to create a space where researchers,
              developers, and enthusiasts can freely discuss and explore AI concepts that
              challenge conventional thinking.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="card text-center">
                <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-accent-cyan" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Research</h3>
                <p className="text-sm text-text-secondary">
                  Cutting-edge AI research and findings
                </p>
              </div>
              <div className="card text-center">
                <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-accent-purple" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Discussions</h3>
                <p className="text-sm text-text-secondary">
                  Open dialogue on controversial AI topics
                </p>
              </div>
              <div className="card text-center">
                <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="text-accent-cyan" size={24} />
                </div>
                <h3 className="font-semibold mb-2">News</h3>
                <p className="text-sm text-text-secondary">
                  Latest AI news and developments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Latest Posts</h2>
            <Link href="/blog" className="text-accent-cyan hover:underline flex items-center gap-2">
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card hover:ring-2 hover:ring-accent-cyan transition-all group">
                {post.featuredImageUrl && (
                  <img
                    src={post.featuredImageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                  <span>{formatDateShort(post.publishedAt!)}</span>
                  <span>·</span>
                  <span>{calculateReadTime(post.content)} min read</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-cyan transition-colors">
                  {post.title}
                </h3>
                <p className="text-text-secondary text-sm line-clamp-3">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Get the latest AI research, discussions, and news delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-secondary-light py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                403 AI
              </h3>
              <p className="text-sm text-text-secondary">
                Exploring forbidden knowledge in AI/ML
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link href="/blog" className="hover:text-accent-cyan">Blog</Link></li>
                <li><Link href="/about" className="hover:text-accent-cyan">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link href="/privacy" className="hover:text-accent-cyan">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-accent-cyan">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-sm text-text-secondary">
                Join our community and stay updated
              </p>
            </div>
          </div>
          <div className="border-t border-secondary-light mt-8 pt-8 text-center text-sm text-text-secondary">
            <p>&copy; {new Date().getFullYear()} 403 AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

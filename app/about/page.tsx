import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, MessageSquare, Newspaper, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - 403 AI',
  description:
    'Learn about 403 AI mission to explore forbidden knowledge in artificial intelligence and machine learning.',
  openGraph: {
    title: 'About - 403 AI',
    description:
      'Learn about 403 AI mission to explore forbidden knowledge in artificial intelligence and machine learning.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
              About 403 AI
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8">
              Exploring Forbidden Knowledge in AI/ML
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-text-secondary leading-relaxed mb-4">
                403 AI - Forbidden AI is a platform dedicated to pushing the
                boundaries of artificial intelligence research and discussion.
                We believe that true innovation comes from exploring the
                uncharted territories of AI, challenging conventional thinking,
                and asking the questions others might avoid.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed mb-4">
                Our mission is to create a space where researchers, developers,
                and enthusiasts can freely discuss and explore AI concepts that
                challenge the status quo. We're not afraid to tackle
                controversial topics, dive into cutting-edge research, or
                question the ethical implications of emerging technologies.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                The name "403 AI" represents our commitment to accessing the
                "forbidden" - the ideas and discussions that push beyond
                traditional boundaries while maintaining ethical responsibility
                and scientific rigor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              What We Do
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="text-accent-cyan" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Research & Analysis</h3>
                <p className="text-text-secondary">
                  We publish in-depth articles on cutting-edge AI research,
                  breaking down complex topics and exploring their implications
                  for the future of technology and society.
                </p>
              </div>

              <div className="card">
                <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="text-accent-purple" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Open Discussions</h3>
                <p className="text-text-secondary">
                  We facilitate open dialogue on controversial AI topics,
                  providing a platform for diverse perspectives and thoughtful
                  debate on the ethical and technical challenges facing AI.
                </p>
              </div>

              <div className="card">
                <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center mb-4">
                  <Newspaper className="text-accent-cyan" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">AI News & Updates</h3>
                <p className="text-text-secondary">
                  Stay informed with the latest developments in AI, from
                  breakthrough research papers to industry news and emerging
                  trends that are shaping the future.
                </p>
              </div>

              <div className="card">
                <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-accent-purple" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Building</h3>
                <p className="text-text-secondary">
                  We're building a community of AI enthusiasts, researchers, and
                  developers who aren't afraid to explore the frontiers of
                  artificial intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Values</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-accent-cyan pl-6">
                <h3 className="text-xl font-bold mb-2">Intellectual Freedom</h3>
                <p className="text-text-secondary">
                  We believe in the freedom to explore ideas, ask difficult
                  questions, and challenge assumptions without fear of censorship
                  or judgment.
                </p>
              </div>

              <div className="border-l-4 border-accent-purple pl-6">
                <h3 className="text-xl font-bold mb-2">Scientific Rigor</h3>
                <p className="text-text-secondary">
                  While we explore controversial topics, we maintain high
                  standards of scientific accuracy and evidence-based reasoning
                  in all our content.
                </p>
              </div>

              <div className="border-l-4 border-accent-cyan pl-6">
                <h3 className="text-xl font-bold mb-2">Ethical Responsibility</h3>
                <p className="text-text-secondary">
                  We recognize the power and potential risks of AI technology and
                  approach all discussions with a sense of ethical responsibility
                  and awareness.
                </p>
              </div>

              <div className="border-l-4 border-accent-purple pl-6">
                <h3 className="text-xl font-bold mb-2">Open Dialogue</h3>
                <p className="text-text-secondary">
                  We foster respectful, open dialogue where diverse perspectives
                  are welcomed and thoughtful disagreement is encouraged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Conversation
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Explore our latest articles, join discussions, and be part of a
              community that's not afraid to ask the hard questions about AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog" className="btn-primary">
                Read Our Blog
              </Link>
              <Link href="/signup" className="btn-outline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 border-t border-secondary-light">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-sm text-text-secondary">
            Last updated: October 2024
          </div>
        </div>
      </section>
    </div>
  );
}

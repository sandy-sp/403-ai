import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@403-ai.com' },
    update: {},
    create: {
      email: 'admin@403-ai.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ai-research' },
      update: {},
      create: {
        name: 'AI Research',
        slug: 'ai-research',
        description: 'Latest research in artificial intelligence and machine learning',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'machine-learning' },
      update: {},
      create: {
        name: 'Machine Learning',
        slug: 'machine-learning',
        description: 'Machine learning algorithms, techniques, and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'deep-learning' },
      update: {},
      create: {
        name: 'Deep Learning',
        slug: 'deep-learning',
        description: 'Neural networks and deep learning architectures',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nlp' },
      update: {},
      create: {
        name: 'Natural Language Processing',
        slug: 'nlp',
        description: 'NLP techniques, models, and applications',
      },
    }),
  ]);

  console.log('✅ Created categories:', categories.length);

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'gpt' },
      update: {},
      create: { name: 'GPT', slug: 'gpt' },
    }),
    prisma.tag.upsert({
      where: { slug: 'transformers' },
      update: {},
      create: { name: 'Transformers', slug: 'transformers' },
    }),
    prisma.tag.upsert({
      where: { slug: 'llm' },
      update: {},
      create: { name: 'LLM', slug: 'llm' },
    }),
    prisma.tag.upsert({
      where: { slug: 'computer-vision' },
      update: {},
      create: { name: 'Computer Vision', slug: 'computer-vision' },
    }),
    prisma.tag.upsert({
      where: { slug: 'reinforcement-learning' },
      update: {},
      create: { name: 'Reinforcement Learning', slug: 'reinforcement-learning' },
    }),
  ]);

  console.log('✅ Created tags:', tags.length);

  // Create sample blog post
  const post = await prisma.post.upsert({
    where: { slug: 'welcome-to-403-ai' },
    update: {},
    create: {
      title: 'Welcome to 403 AI - Forbidden AI',
      slug: 'welcome-to-403-ai',
      content: `
        <h2>Exploring the Forbidden Frontiers of AI</h2>
        <p>Welcome to 403 AI, a platform dedicated to pushing the boundaries of artificial intelligence research and discussion. We believe that true innovation comes from exploring the uncharted territories of AI/ML.</p>
        
        <h3>What We Do</h3>
        <p>At 403 AI, we:</p>
        <ul>
          <li>Share cutting-edge AI research and findings</li>
          <li>Facilitate discussions on controversial AI topics</li>
          <li>Publish the latest AI news and developments</li>
          <li>Explore the ethical implications of advanced AI</li>
        </ul>
        
        <h3>Our Mission</h3>
        <p>Our mission is to create a space where researchers, developers, and enthusiasts can freely discuss and explore AI concepts that challenge conventional thinking. We believe in transparency, open dialogue, and pushing the boundaries of what's possible.</p>
        
        <h3>Join Us</h3>
        <p>Whether you're a researcher, developer, or simply curious about AI, we invite you to join our community and be part of the conversation.</p>
      `,
      excerpt: 'Welcome to 403 AI - a platform for exploring the forbidden frontiers of artificial intelligence and machine learning.',
      authorId: admin.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      metaTitle: 'Welcome to 403 AI - Forbidden AI',
      metaDescription: 'Discover 403 AI, your platform for exploring cutting-edge AI research and forbidden knowledge in machine learning.',
      categories: {
        create: [
          { categoryId: categories[0].id },
        ],
      },
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[2].id },
        ],
      },
    },
  });

  console.log('✅ Created sample post:', post.title);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

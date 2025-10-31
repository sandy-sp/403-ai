import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FileText, Eye, Edit, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  // Fetch statistics
  const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
  ]);

  // Fetch recent posts
  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  const stats = [
    {
      name: 'Total Posts',
      value: totalPosts,
      icon: FileText,
      color: 'text-accent-cyan',
    },
    {
      name: 'Published',
      value: publishedPosts,
      icon: Edit,
      color: 'text-status-success',
    },
    {
      name: 'Drafts',
      value: draftPosts,
      icon: Clock,
      color: 'text-status-warning',
    },
    {
      name: 'Total Views',
      value: totalViews._sum.viewCount || 0,
      icon: Eye,
      color: 'text-accent-purple',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Overview of your blog performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color}`}>
                  <Icon size={32} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Posts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Posts</h2>
          <a href="/admin/posts" className="text-accent-cyan hover:underline text-sm">
            View All
          </a>
        </div>

        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 bg-secondary-light rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium mb-1">{post.title}</h3>
                <p className="text-sm text-text-secondary">
                  By {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === 'PUBLISHED'
                      ? 'bg-status-success/20 text-status-success'
                      : post.status === 'DRAFT'
                      ? 'bg-status-warning/20 text-status-warning'
                      : 'bg-secondary text-text-secondary'
                  }`}
                >
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { TopPostsList } from '@/components/admin/TopPostsList';
import { TopCategoriesList } from '@/components/admin/TopCategoriesList';
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed';
import { FileText, Eye, Edit, Clock, MessageSquare, Mail, Calendar } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  // Get enhanced analytics data
  const analytics = await AnalyticsService.getDashboardAnalytics();

  const stats = [
    {
      name: 'Total Posts',
      value: analytics.totalPosts,
      icon: FileText,
      color: 'text-accent-cyan',
    },
    {
      name: 'Published',
      value: analytics.publishedPosts,
      icon: Edit,
      color: 'text-status-success',
    },
    {
      name: 'Scheduled',
      value: analytics.scheduledPosts,
      icon: Calendar,
      color: 'text-status-warning',
    },
    {
      name: 'Total Views',
      value: analytics.totalViews,
      icon: Eye,
      color: 'text-accent-purple',
    },
    {
      name: 'Comments',
      value: analytics.totalComments,
      icon: MessageSquare,
      color: 'text-accent-cyan',
    },
    {
      name: 'Subscribers',
      value: analytics.totalSubscribers,
      icon: Mail,
      color: 'text-accent-purple',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Overview of your blog performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-xs mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
                </div>
                <div className={`${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnalyticsChart
          data={analytics.viewsByDay}
          type="views"
          title="Views Over Time (30 days)"
          color="#00FFD1"
        />
        <AnalyticsChart
          data={analytics.postsByDay}
          type="posts"
          title="Posts Published (30 days)"
          color="#B14AED"
        />
      </div>

      {/* Top Content and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopPostsList
          posts={analytics.topPosts}
          title="Top Posts by Views"
          sortBy="views"
        />
        <TopCategoriesList
          categories={analytics.topCategories}
          title="Popular Categories"
        />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed
        comments={analytics.recentComments}
        subscribers={analytics.recentSubscribers}
        title="Recent Activity"
      />
    </div>
  );
}

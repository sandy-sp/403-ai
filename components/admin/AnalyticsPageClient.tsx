'use client';

import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { AnalyticsMetrics } from '@/components/admin/AnalyticsMetrics';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { TopPostsList } from '@/components/admin/TopPostsList';
import { TopCategoriesList } from '@/components/admin/TopCategoriesList';
import { AnalyticsExport } from '@/components/admin/AnalyticsExport';
import { AnalyticsErrorBoundary } from '@/components/common/ErrorBoundary';
import { 
  BarChart3, 
  Eye, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Target
} from 'lucide-react';

interface DateRange {
  start: Date;
  end: Date;
}

interface DetailedAnalytics {
  dateRange: DateRange;
  totalViews: number;
  uniqueViews: number;
  averageViewsPerDay: number;
  totalPosts: number;
  postsPublished: number;
  averagePostsPerDay: number;
  totalComments: number;
  averageCommentsPerPost: number;
  commentApprovalRate: number;
  subscriberGrowth: number;
  viewGrowth: number;
  dailyViews: Array<{ date: string; views: number }>;
  dailyPosts: Array<{ date: string; posts: number }>;
  dailyComments: Array<{ date: string; comments: number }>;
  dailySubscribers: Array<{ date: string; subscribers: number }>;
  topPostsByViews: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    publishedAt: Date;
  }>;
  topPostsByComments: Array<{
    id: string;
    title: string;
    slug: string;
    comments: number;
    publishedAt: Date;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    postCount: number;
    totalViews: number;
    averageViews: number;
  }>;
}

export function AnalyticsPageClient() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (range: DateRange) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });

      const response = await fetch(`/api/admin/analytics/detailed?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <p className="text-status-error mb-4">Error loading analytics: {error}</p>
        <button
          onClick={() => fetchAnalytics(dateRange)}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card text-center">
        <p className="text-text-secondary">No analytics data available</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Views',
      value: analytics.totalViews,
      icon: Eye,
      color: '#00FFD1',
    },
    {
      label: 'Posts Published',
      value: analytics.postsPublished,
      icon: FileText,
      color: '#B14AED',
    },
    {
      label: 'Total Comments',
      value: analytics.totalComments,
      icon: MessageSquare,
      color: '#00FFD1',
    },
    {
      label: 'Avg Views/Day',
      value: analytics.averageViewsPerDay,
      format: 'number' as const,
      icon: TrendingUp,
      color: '#B14AED',
    },
    {
      label: 'Avg Comments/Post',
      value: analytics.averageCommentsPerPost,
      format: 'number' as const,
      icon: Target,
      color: '#00FFD1',
    },
    {
      label: 'Comment Approval Rate',
      value: analytics.commentApprovalRate,
      format: 'percentage' as const,
      icon: Users,
      color: '#2ED573',
    },
    {
      label: 'View Growth',
      value: analytics.viewGrowth,
      format: 'percentage' as const,
      icon: TrendingUp,
      color: analytics.viewGrowth >= 0 ? '#2ED573' : '#FF4757',
    },
    {
      label: 'Subscriber Growth',
      value: analytics.subscriberGrowth,
      format: 'percentage' as const,
      icon: Users,
      color: analytics.subscriberGrowth >= 0 ? '#2ED573' : '#FF4757',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={32} className="text-accent-cyan" />
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <p className="text-text-secondary">
            Detailed insights into your blog&apos;s performance
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <AnalyticsErrorBoundary>
          <AnalyticsMetrics metrics={metrics} />
        </AnalyticsErrorBoundary>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsErrorBoundary>
            <AnalyticsChart
              data={analytics.dailyViews}
              type="views"
              title="Daily Views"
              color="#00FFD1"
              height={250}
            />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary>
            <AnalyticsChart
              data={analytics.dailyPosts}
              type="posts"
              title="Posts Published"
              color="#B14AED"
              height={250}
            />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary>
            <AnalyticsChart
              data={analytics.dailyComments}
              type="comments"
              title="Daily Comments"
              color="#2ED573"
              height={250}
            />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary>
            <AnalyticsChart
              data={analytics.dailySubscribers}
              type="subscribers"
              title="New Subscribers"
              color="#FFA502"
              height={250}
            />
          </AnalyticsErrorBoundary>
        </div>
      </div>

      {/* Top Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Performing Content</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnalyticsErrorBoundary>
            <TopPostsList
              posts={analytics.topPostsByViews.map(post => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                views: post.views,
                comments: 0, // We don't have comments count in this data
              }))}
              title="Top Posts by Views"
              sortBy="views"
            />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary>
            <TopPostsList
              posts={analytics.topPostsByComments.map(post => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                views: 0, // We don't have views count in this data
                comments: post.comments,
              }))}
              title="Top Posts by Comments"
              sortBy="comments"
            />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary>
            <TopCategoriesList
              categories={analytics.topCategories}
              title="Popular Categories"
            />
          </AnalyticsErrorBoundary>
        </div>
      </div>

      {/* Export */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <AnalyticsErrorBoundary>
          <AnalyticsExport data={analytics} dateRange={dateRange} />
        </AnalyticsErrorBoundary>
      </div>
    </div>
  );
}
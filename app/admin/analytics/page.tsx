import { requireAdmin } from '@/lib/auth';
import { AnalyticsPageClient } from '@/components/admin/AnalyticsPageClient';
import { AnalyticsErrorBoundary } from '@/components/common/ErrorBoundary';

export const metadata = {
  title: 'Analytics - Admin',
  description: 'Detailed analytics and insights for your blog',
};
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { AnalyticsMetrics } from '@/components/admin/AnalyticsMetrics';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { TopPostsList } from '@/components/admin/TopPostsList';
import { TopCategoriesList } from '@/components/admin/TopCategoriesList';
import { AnalyticsExport } from '@/components/admin/AnalyticsExport';
import { 
  BarChart3, 
  Eye, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Clock,
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

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <AnalyticsErrorBoundary>
      <AnalyticsPageClient />
    </AnalyticsErrorBoundary>
  );
}
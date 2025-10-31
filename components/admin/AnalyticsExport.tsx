'use client';

import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsExportProps {
  data: any;
  dateRange: { start: Date; end: Date };
}

export function AnalyticsExport({ data, dateRange }: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type: 'overview' | 'posts' | 'categories' | 'daily') => {
    setIsExporting(true);
    
    try {
      const dateStr = `${format(dateRange.start, 'yyyy-MM-dd')}_to_${format(dateRange.end, 'yyyy-MM-dd')}`;
      
      switch (type) {
        case 'overview':
          const overviewData = [{
            date_range: `${format(dateRange.start, 'yyyy-MM-dd')} to ${format(dateRange.end, 'yyyy-MM-dd')}`,
            total_views: data.totalViews,
            total_posts: data.totalPosts,
            total_comments: data.totalComments,
            average_views_per_day: data.averageViewsPerDay,
            average_posts_per_day: data.averagePostsPerDay,
            average_comments_per_post: data.averageCommentsPerPost,
            comment_approval_rate: data.commentApprovalRate,
            subscriber_growth: data.subscriberGrowth,
            view_growth: data.viewGrowth,
          }];
          exportToCSV(overviewData, `analytics_overview_${dateStr}.csv`);
          break;

        case 'posts':
          const postsData = data.topPostsByViews.map((post: any) => ({
            title: post.title,
            slug: post.slug,
            views: post.views,
            published_date: format(new Date(post.publishedAt), 'yyyy-MM-dd'),
          }));
          exportToCSV(postsData, `top_posts_${dateStr}.csv`);
          break;

        case 'categories':
          const categoriesData = data.topCategories.map((category: any) => ({
            name: category.name,
            post_count: category.postCount,
            total_views: category.totalViews,
            average_views: category.averageViews,
          }));
          exportToCSV(categoriesData, `categories_${dateStr}.csv`);
          break;

        case 'daily':
          const dailyData = data.dailyViews.map((day: any, index: number) => ({
            date: day.date,
            views: day.views,
            posts: data.dailyPosts[index]?.posts || 0,
            comments: data.dailyComments[index]?.comments || 0,
            subscribers: data.dailySubscribers[index]?.subscribers || 0,
          }));
          exportToCSV(dailyData, `daily_analytics_${dateStr}.csv`);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Export Data</h3>
      <p className="text-text-secondary text-sm mb-4">
        Export analytics data for the selected date range ({format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')})
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleExport('overview')}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <FileText size={18} />
          <div className="text-left">
            <p className="font-medium text-sm">Overview Report</p>
            <p className="text-xs text-text-secondary">Summary metrics</p>
          </div>
        </button>

        <button
          onClick={() => handleExport('posts')}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <Table size={18} />
          <div className="text-left">
            <p className="font-medium text-sm">Top Posts</p>
            <p className="text-xs text-text-secondary">Performance data</p>
          </div>
        </button>

        <button
          onClick={() => handleExport('categories')}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          <div className="text-left">
            <p className="font-medium text-sm">Categories</p>
            <p className="text-xs text-text-secondary">Category analytics</p>
          </div>
        </button>

        <button
          onClick={() => handleExport('daily')}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-secondary-light rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <FileText size={18} />
          <div className="text-left">
            <p className="font-medium text-sm">Daily Data</p>
            <p className="text-xs text-text-secondary">Time series data</p>
          </div>
        </button>
      </div>

      {isExporting && (
        <div className="mt-4 p-3 bg-accent-cyan/10 rounded-lg">
          <p className="text-sm text-accent-cyan">Preparing export...</p>
        </div>
      )}
    </div>
  );
}
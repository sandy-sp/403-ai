import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/errors';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export interface DashboardAnalytics {
  // Overview stats
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalComments: number;
  totalSubscribers: number;
  
  // Time series data
  viewsByDay: Array<{ date: string; views: number }>;
  postsByDay: Array<{ date: string; posts: number }>;
  
  // Top content
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    comments: number;
  }>;
  
  topCategories: Array<{
    id: string;
    name: string;
    postCount: number;
    totalViews: number;
  }>;
  
  // Recent activity
  recentComments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: { name: string };
    post: { title: string; slug: string };
  }>;
  
  recentSubscribers: Array<{
    id: string;
    email: string;
    createdAt: Date;
  }>;
}

export interface DetailedAnalytics {
  dateRange: {
    start: Date;
    end: Date;
  };
  
  // Traffic analytics
  totalViews: number;
  uniqueViews: number; // For future implementation
  averageViewsPerDay: number;
  
  // Content analytics
  totalPosts: number;
  postsPublished: number;
  averagePostsPerDay: number;
  
  // Engagement analytics
  totalComments: number;
  averageCommentsPerPost: number;
  commentApprovalRate: number;
  
  // Growth analytics
  subscriberGrowth: number;
  viewGrowth: number;
  
  // Time series
  dailyViews: Array<{ date: string; views: number }>;
  dailyPosts: Array<{ date: string; posts: number }>;
  dailyComments: Array<{ date: string; comments: number }>;
  dailySubscribers: Array<{ date: string; subscribers: number }>;
  
  // Top performers
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

export interface DateRange {
  start: Date;
  end: Date;
}

export class AnalyticsService {
  /**
   * Get dashboard analytics data
   */
  static async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      // Skip during build time when database is not available
      if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
        throw new Error('Database not available during build');
      }

      const thirtyDaysAgo = subDays(new Date(), 30);
      
      // Get basic counts
      const [
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        totalViews,
        totalComments,
        totalSubscribers,
      ] = await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: 'PUBLISHED' } }),
        prisma.post.count({ where: { status: 'DRAFT' } }),
        prisma.post.count({ where: { status: 'SCHEDULED' } }),
        prisma.post.aggregate({ _sum: { viewCount: true } }),
        prisma.comment.count({ where: { status: 'APPROVED' } }),
        prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      ]);

      // Get views by day for the last 30 days
      const viewsByDay = await this.getViewsByDay(thirtyDaysAgo, new Date());
      
      // Get posts by day for the last 30 days
      const postsByDay = await this.getPostsByDay(thirtyDaysAgo, new Date());

      // Get top posts
      const topPosts = await prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          _count: {
            select: { comments: { where: { status: 'APPROVED' } } },
          },
        },
      });

      // Get top categories
      const topCategories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { posts: { where: { post: { status: 'PUBLISHED' } } } },
          },
          posts: {
            select: {
              post: {
                select: { viewCount: true },
              },
            },
            where: { post: { status: 'PUBLISHED' } },
          },
        },
        orderBy: {
          posts: { _count: 'desc' },
        },
        take: 5,
      });

      // Get recent comments
      const recentComments = await prisma.comment.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { name: true } },
          post: { select: { title: true, slug: true } },
        },
      });

      // Get recent subscribers
      const recentSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        totalViews: totalViews._sum.viewCount || 0,
        totalComments,
        totalSubscribers,
        viewsByDay,
        postsByDay,
        topPosts: topPosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          views: post.viewCount,
          comments: post._count.comments,
        })),
        topCategories: topCategories.map(category => ({
          id: category.id,
          name: category.name,
          postCount: category._count.posts,
          totalViews: category.posts.reduce((sum, p) => sum + p.post.viewCount, 0),
        })),
        recentComments,
        recentSubscribers,
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      handlePrismaError(error);
    }
  }

  /**
   * Get detailed analytics for a date range
   */
  static async getDetailedAnalytics(dateRange: DateRange): Promise<DetailedAnalytics> {
    try {
      // Skip during build time when database is not available
      if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
        throw new Error('Database not available during build');
      }

      const { start, end } = dateRange;
      const previousPeriodStart = subDays(start, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const previousPeriodEnd = start;

      // Current period stats
      const [
        currentViews,
        currentPosts,
        currentComments,
        currentSubscribers,
      ] = await Promise.all([
        prisma.post.aggregate({
          _sum: { viewCount: true },
          where: {
            publishedAt: { gte: start, lte: end },
            status: 'PUBLISHED',
          },
        }),
        prisma.post.count({
          where: {
            publishedAt: { gte: start, lte: end },
            status: 'PUBLISHED',
          },
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: start, lte: end },
            status: 'APPROVED',
          },
        }),
        prisma.newsletterSubscriber.count({
          where: {
            createdAt: { gte: start, lte: end },
            status: 'ACTIVE',
          },
        }),
      ]);

      // Previous period stats for growth calculation
      const [
        previousViews,
        previousSubscribers,
      ] = await Promise.all([
        prisma.post.aggregate({
          _sum: { viewCount: true },
          where: {
            publishedAt: { gte: previousPeriodStart, lte: previousPeriodEnd },
            status: 'PUBLISHED',
          },
        }),
        prisma.newsletterSubscriber.count({
          where: {
            createdAt: { gte: previousPeriodStart, lte: previousPeriodEnd },
            status: 'ACTIVE',
          },
        }),
      ]);

      // Time series data
      const [dailyViews, dailyPosts, dailyComments, dailySubscribers] = await Promise.all([
        this.getViewsByDay(start, end),
        this.getPostsByDay(start, end),
        this.getCommentsByDay(start, end),
        this.getSubscribersByDay(start, end),
      ]);

      // Top performers
      const [topPostsByViews, topPostsByComments, topCategories] = await Promise.all([
        this.getTopPostsByViews(start, end),
        this.getTopPostsByComments(start, end),
        this.getTopCategories(start, end),
      ]);

      // Calculate metrics
      const totalViews = currentViews._sum.viewCount || 0;
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const averageViewsPerDay = daysDiff > 0 ? totalViews / daysDiff : 0;
      const averagePostsPerDay = daysDiff > 0 ? currentPosts / daysDiff : 0;
      const averageCommentsPerPost = currentPosts > 0 ? currentComments / currentPosts : 0;

      // Growth calculations
      const previousTotalViews = previousViews._sum.viewCount || 0;
      const viewGrowth = previousTotalViews > 0 
        ? ((totalViews - previousTotalViews) / previousTotalViews) * 100 
        : 0;
      
      const subscriberGrowth = previousSubscribers > 0 
        ? ((currentSubscribers - previousSubscribers) / previousSubscribers) * 100 
        : 0;

      // Comment approval rate
      const totalCommentsSubmitted = await prisma.comment.count({
        where: { createdAt: { gte: start, lte: end } },
      });
      const commentApprovalRate = totalCommentsSubmitted > 0 
        ? (currentComments / totalCommentsSubmitted) * 100 
        : 0;

      return {
        dateRange: { start, end },
        totalViews,
        uniqueViews: totalViews, // Placeholder - implement unique tracking later
        averageViewsPerDay,
        totalPosts: currentPosts,
        postsPublished: currentPosts,
        averagePostsPerDay,
        totalComments: currentComments,
        averageCommentsPerPost,
        commentApprovalRate,
        subscriberGrowth,
        viewGrowth,
        dailyViews,
        dailyPosts,
        dailyComments,
        dailySubscribers,
        topPostsByViews,
        topPostsByComments,
        topCategories,
      };
    } catch (error) {
      console.error('Error getting detailed analytics:', error);
      handlePrismaError(error);
    }
  }

  /**
   * Get views by day for a date range
   */
  private static async getViewsByDay(start: Date, end: Date): Promise<Array<{ date: string; views: number }>> {
    try {
      // Since we don't have daily view tracking, we'll aggregate by post publish date
      const posts = await prisma.post.findMany({
        where: {
          publishedAt: { gte: start, lte: end },
          status: 'PUBLISHED',
        },
        select: {
          publishedAt: true,
          viewCount: true,
        },
      });

      const viewsByDate = new Map<string, number>();
      
      // Initialize all dates with 0
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        viewsByDate.set(dateStr, 0);
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      // Aggregate views by publish date
      posts.forEach(post => {
        if (post.publishedAt) {
          const dateStr = format(post.publishedAt, 'yyyy-MM-dd');
          const currentViews = viewsByDate.get(dateStr) || 0;
          viewsByDate.set(dateStr, currentViews + post.viewCount);
        }
      });

      return Array.from(viewsByDate.entries()).map(([date, views]) => ({
        date,
        views,
      }));
    } catch (error) {
      console.error('Error getting views by day:', error);
      return [];
    }
  }

  /**
   * Get posts by day for a date range
   */
  private static async getPostsByDay(start: Date, end: Date): Promise<Array<{ date: string; posts: number }>> {
    try {
      const posts = await prisma.post.groupBy({
        by: ['publishedAt'],
        where: {
          publishedAt: { gte: start, lte: end },
          status: 'PUBLISHED',
        },
        _count: true,
      });

      const postsByDate = new Map<string, number>();
      
      // Initialize all dates with 0
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        postsByDate.set(dateStr, 0);
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      // Aggregate posts by date
      posts.forEach(post => {
        if (post.publishedAt) {
          const dateStr = format(post.publishedAt, 'yyyy-MM-dd');
          const currentCount = postsByDate.get(dateStr) || 0;
          postsByDate.set(dateStr, currentCount + post._count);
        }
      });

      return Array.from(postsByDate.entries()).map(([date, posts]) => ({
        date,
        posts,
      }));
    } catch (error) {
      console.error('Error getting posts by day:', error);
      return [];
    }
  }

  /**
   * Get comments by day for a date range
   */
  private static async getCommentsByDay(start: Date, end: Date): Promise<Array<{ date: string; comments: number }>> {
    try {
      const comments = await prisma.comment.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: start, lte: end },
          status: 'APPROVED',
        },
        _count: true,
      });

      const commentsByDate = new Map<string, number>();
      
      // Initialize all dates with 0
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        commentsByDate.set(dateStr, 0);
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      // Aggregate comments by date
      comments.forEach(comment => {
        const dateStr = format(comment.createdAt, 'yyyy-MM-dd');
        const currentCount = commentsByDate.get(dateStr) || 0;
        commentsByDate.set(dateStr, currentCount + comment._count);
      });

      return Array.from(commentsByDate.entries()).map(([date, comments]) => ({
        date,
        comments,
      }));
    } catch (error) {
      console.error('Error getting comments by day:', error);
      return [];
    }
  }

  /**
   * Get subscribers by day for a date range
   */
  private static async getSubscribersByDay(start: Date, end: Date): Promise<Array<{ date: string; subscribers: number }>> {
    try {
      const subscribers = await prisma.newsletterSubscriber.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: start, lte: end },
          status: 'ACTIVE',
        },
        _count: true,
      });

      const subscribersByDate = new Map<string, number>();
      
      // Initialize all dates with 0
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        subscribersByDate.set(dateStr, 0);
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      // Aggregate subscribers by date
      subscribers.forEach(subscriber => {
        const dateStr = format(subscriber.createdAt, 'yyyy-MM-dd');
        const currentCount = subscribersByDate.get(dateStr) || 0;
        subscribersByDate.set(dateStr, currentCount + subscriber._count);
      });

      return Array.from(subscribersByDate.entries()).map(([date, subscribers]) => ({
        date,
        subscribers,
      }));
    } catch (error) {
      console.error('Error getting subscribers by day:', error);
      return [];
    }
  }

  /**
   * Get top posts by views
   */
  private static async getTopPostsByViews(start: Date, end: Date) {
    return prisma.post.findMany({
      where: {
        publishedAt: { gte: start, lte: end, not: null },
        status: 'PUBLISHED',
      },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
      },
    }).then(posts => posts
      .filter(post => post.publishedAt !== null)
      .map(post => ({
        ...post,
        views: post.viewCount,
        publishedAt: post.publishedAt!,
      })));
  }

  /**
   * Get top posts by comments
   */
  private static async getTopPostsByComments(start: Date, end: Date) {
    return prisma.post.findMany({
      where: {
        publishedAt: { gte: start, lte: end, not: null },
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        _count: {
          select: { comments: { where: { status: 'APPROVED' } } },
        },
      },
      orderBy: {
        comments: { _count: 'desc' },
      },
      take: 10,
    }).then(posts => posts
      .filter(post => post.publishedAt !== null)
      .map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt!,
        comments: post._count.comments,
      })));
  }

  /**
   * Get top categories
   */
  private static async getTopCategories(start: Date, end: Date) {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        posts: {
          select: {
            post: {
              select: { viewCount: true },
            },
          },
          where: {
            post: {
              publishedAt: { gte: start, lte: end },
              status: 'PUBLISHED',
            },
          },
        },
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  publishedAt: { gte: start, lte: end },
                  status: 'PUBLISHED',
                },
              },
            },
          },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
      take: 10,
    });

    return categories.map(category => {
      const totalViews = category.posts.reduce((sum, p) => sum + p.post.viewCount, 0);
      const postCount = category._count.posts;
      
      return {
        id: category.id,
        name: category.name,
        postCount,
        totalViews,
        averageViews: postCount > 0 ? totalViews / postCount : 0,
      };
    });
  }

  /**
   * Track page view (for future implementation)
   */
  static async trackPageView(postId: string, metadata?: any): Promise<void> {
    // This is a placeholder for future page view tracking
    // Could be implemented with a separate PageView model
    try {
      // For now, we just increment the post view count
      await prisma.post.update({
        where: { id: postId },
        data: {
          viewCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }
}
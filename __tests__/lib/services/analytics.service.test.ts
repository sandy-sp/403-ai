import { AnalyticsService } from '@/lib/services/analytics.service'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

// Mock Prisma
jest.mock('@/lib/prisma')
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getDashboardAnalytics', () => {
    it('should return dashboard analytics data', async () => {
      // Mock database responses
      mockPrisma.post.count
        .mockResolvedValueOnce(100) // totalPosts
        .mockResolvedValueOnce(80)  // publishedPosts
        .mockResolvedValueOnce(15)  // draftPosts
        .mockResolvedValueOnce(5)   // scheduledPosts

      mockPrisma.post.aggregate.mockResolvedValue({
        _sum: { viewCount: 5000 }
      } as any)

      mockPrisma.comment.count.mockResolvedValue(250)
      mockPrisma.newsletterSubscriber.count.mockResolvedValue(150)

      mockPrisma.post.findMany
        .mockResolvedValueOnce([]) // viewsByDay posts
        .mockResolvedValueOnce([]) // postsByDay posts
        .mockResolvedValueOnce([   // topPosts
          {
            id: '1',
            title: 'Top Post',
            slug: 'top-post',
            viewCount: 1000,
            _count: { comments: 10 }
          }
        ])

      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'AI',
          _count: { posts: 5 },
          posts: [
            { post: { viewCount: 100 } },
            { post: { viewCount: 200 } }
          ]
        }
      ] as any)

      mockPrisma.comment.findMany.mockResolvedValue([
        {
          id: '1',
          content: 'Test comment',
          createdAt: new Date(),
          user: { name: 'Test User' },
          post: { title: 'Test Post', slug: 'test-post' }
        }
      ] as any)

      mockPrisma.newsletterSubscriber.findMany.mockResolvedValue([
        {
          id: '1',
          email: 'test@example.com',
          createdAt: new Date()
        }
      ] as any)

      const result = await AnalyticsService.getDashboardAnalytics()

      expect(result).toEqual({
        totalPosts: 100,
        publishedPosts: 80,
        draftPosts: 15,
        scheduledPosts: 5,
        totalViews: 5000,
        totalComments: 250,
        totalSubscribers: 150,
        viewsByDay: expect.any(Array),
        postsByDay: expect.any(Array),
        topPosts: expect.any(Array),
        topCategories: expect.any(Array),
        recentComments: expect.any(Array),
        recentSubscribers: expect.any(Array)
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.post.count.mockRejectedValue(new Error('Database error'))

      await expect(AnalyticsService.getDashboardAnalytics()).rejects.toThrow()
    })
  })

  describe('getDetailedAnalytics', () => {
    it('should return detailed analytics for date range', async () => {
      const dateRange = {
        start: subDays(new Date(), 30),
        end: new Date()
      }

      // Mock current period stats
      mockPrisma.post.aggregate
        .mockResolvedValueOnce({ _sum: { viewCount: 1000 } } as any) // current views
        .mockResolvedValueOnce({ _sum: { viewCount: 800 } } as any)  // previous views

      mockPrisma.post.count
        .mockResolvedValueOnce(10) // current posts
        
      mockPrisma.comment.count
        .mockResolvedValueOnce(50) // current comments
        .mockResolvedValueOnce(60) // total comments for approval rate

      mockPrisma.newsletterSubscriber.count
        .mockResolvedValueOnce(20) // current subscribers
        .mockResolvedValueOnce(15) // previous subscribers

      // Mock time series data
      mockPrisma.post.findMany
        .mockResolvedValueOnce([]) // viewsByDay
        .mockResolvedValueOnce([]) // topPostsByViews
        .mockResolvedValueOnce([]) // topPostsByComments

      mockPrisma.post.groupBy.mockResolvedValue([])
      mockPrisma.comment.groupBy.mockResolvedValue([])
      mockPrisma.newsletterSubscriber.groupBy.mockResolvedValue([])
      mockPrisma.category.findMany.mockResolvedValue([])

      const result = await AnalyticsService.getDetailedAnalytics(dateRange)

      expect(result).toEqual({
        dateRange,
        totalViews: 1000,
        uniqueViews: 1000,
        averageViewsPerDay: expect.any(Number),
        totalPosts: 10,
        postsPublished: 10,
        averagePostsPerDay: expect.any(Number),
        totalComments: 50,
        averageCommentsPerPost: 5,
        commentApprovalRate: expect.any(Number),
        subscriberGrowth: expect.any(Number),
        viewGrowth: expect.any(Number),
        dailyViews: expect.any(Array),
        dailyPosts: expect.any(Array),
        dailyComments: expect.any(Array),
        dailySubscribers: expect.any(Array),
        topPostsByViews: [],
        topPostsByComments: [],
        topCategories: []
      })
    })
  })

  describe('trackPageView', () => {
    it('should increment post view count', async () => {
      mockPrisma.post.update.mockResolvedValue({} as any)

      await AnalyticsService.trackPageView('post-id')

      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-id' },
        data: {
          viewCount: { increment: 1 }
        }
      })
    })

    it('should handle errors gracefully', async () => {
      mockPrisma.post.update.mockRejectedValue(new Error('Database error'))

      // Should not throw
      await expect(AnalyticsService.trackPageView('post-id')).resolves.toBeUndefined()
    })
  })
})
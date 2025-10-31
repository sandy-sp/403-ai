import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import {
  NotFoundError,
  AuthorizationError,
  handlePrismaError,
} from '@/lib/errors';
import { CommentStatus } from '@prisma/client';

export interface CommentFilters {
  status?: CommentStatus;
  postId?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommentsResponse {
  comments: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class CommentService {
  /**
   * Create a new comment
   * @param postId - Post ID
   * @param userId - User ID
   * @param content - Comment content
   * @returns Created comment
   */
  static async createComment(
    postId: string,
    userId: string,
    content: string
  ) {
    try {
      // Sanitize content
      const sanitizedContent = sanitizeHtml(content);

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content: sanitizedContent,
          status: 'PENDING', // Require approval
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Get comments for a post (approved only for public)
   * @param postId - Post ID
   * @param includeAll - Include all statuses (admin only)
   * @returns Array of comments
   */
  static async getPostComments(postId: string, includeAll: boolean = false) {
    try {
      const where: any = { postId };

      if (!includeAll) {
        where.status = 'APPROVED';
      }

      const comments = await prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      return comments;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Get all comments with filters (admin only)
   * @param filters - Filter options
   * @returns Paginated comments list
   */
  static async getAllComments(
    filters: CommentFilters = {}
  ): Promise<CommentsResponse> {
    try {
      const {
        status,
        postId,
        userId,
        search,
        page = 1,
        limit = 50,
      } = filters;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (postId) {
        where.postId = postId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (search) {
        where.content = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        }),
        prisma.comment.count({ where }),
      ]);

      return {
        comments,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Approve a comment
   * @param commentId - Comment ID
   */
  static async approveComment(commentId: string): Promise<void> {
    try {
      await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'APPROVED' },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Mark comment as spam
   * @param commentId - Comment ID
   */
  static async markAsSpam(commentId: string): Promise<void> {
    try {
      await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'SPAM' },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Delete a comment
   * @param commentId - Comment ID
   * @param userId - User ID (for authorization)
   */
  static async deleteComment(commentId: string, userId?: string): Promise<void> {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true },
      });

      if (!comment) {
        throw new NotFoundError('Comment');
      }

      // Check if user owns the comment (if userId provided)
      if (userId && comment.userId !== userId) {
        throw new AuthorizationError('You can only delete your own comments');
      }

      await prisma.comment.delete({
        where: { id: commentId },
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Update a comment
   * @param commentId - Comment ID
   * @param userId - User ID (for authorization)
   * @param content - New content
   */
  static async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<void> {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true },
      });

      if (!comment) {
        throw new NotFoundError('Comment');
      }

      if (comment.userId !== userId) {
        throw new AuthorizationError('You can only edit your own comments');
      }

      const sanitizedContent = sanitizeHtml(content);

      await prisma.comment.update({
        where: { id: commentId },
        data: {
          content: sanitizedContent,
          // Reset to pending if edited
          status: 'PENDING',
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Get comment statistics
   * @returns Statistics object
   */
  static async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    spam: number;
  }> {
    try {
      const [total, pending, approved, spam] = await Promise.all([
        prisma.comment.count(),
        prisma.comment.count({ where: { status: 'PENDING' } }),
        prisma.comment.count({ where: { status: 'APPROVED' } }),
        prisma.comment.count({ where: { status: 'SPAM' } }),
      ]);

      return { total, pending, approved, spam };
    } catch (error) {
      console.error('Error getting comment statistics:', error);
      return { total: 0, pending: 0, approved: 0, spam: 0 };
    }
  }

  /**
   * Get comment count for a post
   * @param postId - Post ID
   * @returns Comment count
   */
  static async getCommentCount(postId: string): Promise<number> {
    try {
      return await prisma.comment.count({
        where: {
          postId,
          status: 'APPROVED',
        },
      });
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }
}

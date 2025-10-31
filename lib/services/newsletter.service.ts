import { prisma } from '@/lib/prisma';
import { generateSecureToken } from '@/lib/utils/crypto';
import {
  ConflictError,
  NotFoundError,
  handlePrismaError,
} from '@/lib/errors';
import { SubscriberStatus } from '@prisma/client';

export interface SubscriberFilters {
  status?: SubscriberStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubscribersResponse {
  subscribers: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class NewsletterService {
  /**
   * Subscribe a new email to the newsletter
   * @param email - Subscriber email
   * @returns Confirmation token
   */
  static async subscribe(email: string): Promise<string> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if already subscribed
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        if (existing.status === 'ACTIVE') {
          throw new ConflictError('This email is already subscribed');
        }
        if (existing.status === 'PENDING') {
          // Resend confirmation
          const token = generateSecureToken(32);
          await prisma.newsletterSubscriber.update({
            where: { id: existing.id },
            data: { updatedAt: new Date() },
          });
          return token;
        }
        if (existing.status === 'UNSUBSCRIBED') {
          // Resubscribe
          await prisma.newsletterSubscriber.update({
            where: { id: existing.id },
            data: {
              status: 'PENDING',
              unsubscribedAt: null,
              updatedAt: new Date(),
            },
          });
          return generateSecureToken(32);
        }
      }

      // Create new subscriber
      const token = generateSecureToken(32);
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          status: 'PENDING',
        },
      });

      return token;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Confirm subscription with token
   * @param email - Subscriber email
   * @param token - Confirmation token (for future use)
   */
  static async confirmSubscription(email: string): Promise<void> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      });

      if (!subscriber) {
        throw new NotFoundError('Subscriber');
      }

      if (subscriber.status === 'ACTIVE') {
        // Already confirmed, no action needed
        return;
      }

      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'ACTIVE',
          confirmedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Unsubscribe from newsletter
   * @param email - Subscriber email
   */
  static async unsubscribe(email: string): Promise<void> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      });

      if (!subscriber) {
        // Silently succeed if not found
        return;
      }

      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Get all subscribers with filters (admin only)
   * @param filters - Filter options
   * @returns Paginated subscribers list
   */
  static async getSubscribers(
    filters: SubscriberFilters = {}
  ): Promise<SubscribersResponse> {
    try {
      const {
        status,
        search,
        page = 1,
        limit = 50,
      } = filters;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.email = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const [subscribers, total] = await Promise.all([
        prisma.newsletterSubscriber.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.newsletterSubscriber.count({ where }),
      ]);

      return {
        subscribers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Get all active subscribers for sending newsletters
   * @returns Array of active subscriber emails
   */
  static async getActiveSubscribers(): Promise<string[]> {
    try {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: 'ACTIVE' },
        select: { email: true },
      });

      return subscribers.map((s) => s.email);
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      return [];
    }
  }

  /**
   * Get subscriber statistics
   * @returns Statistics object
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    pending: number;
    unsubscribed: number;
  }> {
    try {
      const [total, active, pending, unsubscribed] = await Promise.all([
        prisma.newsletterSubscriber.count(),
        prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
        prisma.newsletterSubscriber.count({ where: { status: 'PENDING' } }),
        prisma.newsletterSubscriber.count({
          where: { status: 'UNSUBSCRIBED' },
        }),
      ]);

      return { total, active, pending, unsubscribed };
    } catch (error) {
      console.error('Error getting newsletter statistics:', error);
      return { total: 0, active: 0, pending: 0, unsubscribed: 0 };
    }
  }

  /**
   * Delete a subscriber permanently (admin only)
   * @param id - Subscriber ID
   */
  static async deleteSubscriber(id: string): Promise<void> {
    try {
      await prisma.newsletterSubscriber.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Export subscribers to CSV format
   * @param status - Optional status filter
   * @returns CSV string
   */
  static async exportToCSV(status?: SubscriberStatus): Promise<string> {
    try {
      const where = status ? { status } : {};

      const subscribers = await prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // CSV header
      let csv = 'Email,Status,Subscribed Date,Confirmed Date,Unsubscribed Date\n';

      // CSV rows
      subscribers.forEach((sub) => {
        csv += `${sub.email},${sub.status},${sub.createdAt.toISOString()},${
          sub.confirmedAt ? sub.confirmedAt.toISOString() : ''
        },${sub.unsubscribedAt ? sub.unsubscribedAt.toISOString() : ''}\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      throw new Error('Failed to export subscribers');
    }
  }
}

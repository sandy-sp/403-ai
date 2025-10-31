import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordResetService } from '@/lib/services/password-reset.service';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      publishedPosts: 0,
      cleanedTokens: 0,
      errors: [] as string[],
    };

    // 1. Publish scheduled posts
    try {
      const now = new Date();
      const scheduledPosts = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          publishedAt: {
            lte: now,
          },
        },
      });

      const publishedPosts = await Promise.all(
        scheduledPosts.map((post) =>
          prisma.post.update({
            where: { id: post.id },
            data: { status: 'PUBLISHED' },
          })
        )
      );

      results.publishedPosts = publishedPosts.length;
    } catch (error) {
      console.error('Error publishing scheduled posts:', error);
      results.errors.push('Failed to publish scheduled posts');
    }

    // 2. Clean up expired password reset tokens
    try {
      const deletedCount = await PasswordResetService.cleanupExpiredTokens();
      results.cleanedTokens = deletedCount;
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      results.errors.push('Failed to cleanup expired tokens');
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      message: `Daily maintenance completed: Published ${results.publishedPosts} posts, cleaned ${results.cleanedTokens} tokens`,
      results,
    });
  } catch (error) {
    console.error('Error in daily maintenance:', error);
    return NextResponse.json(
      { error: 'Daily maintenance failed' },
      { status: 500 }
    );
  }
}
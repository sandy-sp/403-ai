import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all scheduled posts that should be published
    const now = new Date();
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now,
        },
      },
    });

    // Update posts to published status
    const publishedPosts = await Promise.all(
      scheduledPosts.map((post) =>
        prisma.post.update({
          where: { id: post.id },
          data: { status: 'PUBLISHED' },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Published ${publishedPosts.length} scheduled posts`,
      published: publishedPosts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
      })),
    });
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts' },
      { status: 500 }
    );
  }
}

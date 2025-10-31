import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { EmailService } from '@/lib/services/email.service';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { commentRateLimit, withRateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitCheck = withRateLimit(commentRateLimit)(request);
    if ('error' in rateLimitCheck) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { 
          status: rateLimitCheck.status,
          headers: rateLimitCheck.headers,
        }
      );
    }

    const session = await requireAuth();
    const body = await request.json();
    const { content } = createCommentSchema.parse(body);

    const comment = await CommentService.createComment(
      params.id,
      session.user.id,
      content
    );

    // Send notification email to admin (don't block comment creation if email fails)
    try {
      // Get post details and admin email
      const [post, adminUser] = await Promise.all([
        prisma.post.findUnique({
          where: { id: params.id },
          select: { title: true, slug: true },
        }),
        prisma.user.findFirst({
          where: { role: 'ADMIN' },
          select: { email: true },
        }),
      ]);

      if (post && adminUser) {
        await EmailService.sendCommentNotification(adminUser.email, {
          postTitle: post.title,
          postSlug: post.slug,
          commentAuthor: session.user.name || 'Anonymous',
          commentContent: content,
          commentId: comment.id,
        });
      }
    } catch (emailError) {
      console.error('Failed to send comment notification email:', emailError);
      // Continue - comment creation should succeed even if email fails
    }

    return NextResponse.json(comment, { 
      status: 201,
      headers: rateLimitCheck.headers,
    });
  } catch (error: any) {
    console.error('Create comment error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await CommentService.getPostComments(params.id, false);
    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Get comments error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

// Update comment (user can edit their own)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const session = await requireAuth();
    const body = await request.json();
    const { content } = updateCommentSchema.parse(body);
    const { id } = await params;

    await CommentService.updateComment(id, session.user.id, content);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update comment error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message?.includes('authorization')) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// Delete comment (user can delete their own, admin can delete any)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const session = await requireAuth();
    const { id } = await params;

    // If admin, can delete any comment
    if (session.user.role === 'ADMIN') {
      await CommentService.deleteComment(id);
    } else {
      // Regular user can only delete their own
      await CommentService.deleteComment(id, session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete comment error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message?.includes('authorization')) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

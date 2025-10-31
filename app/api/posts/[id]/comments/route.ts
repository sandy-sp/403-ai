import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { content } = createCommentSchema.parse(body);

    const comment = await CommentService.createComment(
      params.id,
      session.user.id,
      content
    );

    return NextResponse.json(comment, { status: 201 });
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

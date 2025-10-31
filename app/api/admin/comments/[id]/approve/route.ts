import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await CommentService.approveComment(params.id);

    return NextResponse.json({ message: 'Comment approved successfully' });
  } catch (error: any) {
    console.error('Approve comment error:', error);

    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to approve comment' },
      { status: 500 }
    );
  }
}

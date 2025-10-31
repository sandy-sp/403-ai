import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { requireAdmin } from '@/lib/auth';
import { CommentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as CommentStatus | null;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await CommentService.getAllComments({
      status: status || undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get comments error:', error);

    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

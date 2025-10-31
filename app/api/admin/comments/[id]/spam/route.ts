import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { requireAdmin } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    await requireAdmin();
    await CommentService.markAsSpam(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark spam error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to mark comment as spam' },
      { status: 500 }
    );
  }
}

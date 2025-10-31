import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter.service';
import { requireAdmin } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Require admin authentication
    await requireAdmin();

    await NewsletterService.deleteSubscriber(id);

    return NextResponse.json(
      { message: 'Subscriber deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete subscriber error:', error);

    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

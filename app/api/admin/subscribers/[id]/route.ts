import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter.service';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    await NewsletterService.deleteSubscriber(params.id);

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

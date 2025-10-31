import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// General analytics endpoint that redirects to dashboard by default
export async function GET(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'dashboard';

    if (type === 'dashboard') {
      const analytics = await AnalyticsService.getDashboardAnalytics();
      return NextResponse.json(analytics);
    }

    // For other types, redirect to appropriate endpoints
    return NextResponse.json(
      { error: 'Use specific endpoints: /dashboard or /detailed' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Get analytics error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
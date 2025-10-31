import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const analytics = await AnalyticsService.getDashboardAnalytics();

    // Cache for 5 minutes
    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Get dashboard analytics error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    );
  }
}
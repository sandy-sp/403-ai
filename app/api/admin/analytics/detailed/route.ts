import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { subDays, parseISO } from 'date-fns';
import { z } from 'zod';

const querySchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  period: z.enum(['7d', '30d', '90d', '1y']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      start: searchParams.get('start') || undefined,
      end: searchParams.get('end') || undefined,
      period: searchParams.get('period') || undefined,
    });

    // Determine date range
    let start: Date;
    let end: Date = new Date();

    if (query.start && query.end) {
      start = parseISO(query.start);
      end = parseISO(query.end);
    } else if (query.period) {
      switch (query.period) {
        case '7d':
          start = subDays(end, 7);
          break;
        case '30d':
          start = subDays(end, 30);
          break;
        case '90d':
          start = subDays(end, 90);
          break;
        case '1y':
          start = subDays(end, 365);
          break;
        default:
          start = subDays(end, 30);
      }
    } else {
      // Default to last 30 days
      start = subDays(end, 30);
    }

    const analytics = await AnalyticsService.getDetailedAnalytics({ start, end });

    // Cache for 5 minutes
    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Get detailed analytics error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch detailed analytics' },
      { status: 500 }
    );
  }
}
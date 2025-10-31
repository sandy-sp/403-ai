import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { SettingsService } from '@/lib/services/settings.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
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

    const settings = await SettingsService.getSettingsByCategory(params.category);

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error(`Get ${params.category} settings error:`, error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: `Failed to fetch ${params.category} settings` },
      { status: 500 }
    );
  }
}
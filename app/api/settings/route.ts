import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Public endpoint for getting site settings (no auth required)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let settings;
    if (category) {
      settings = await SettingsService.getSettingsByCategory(category);
    } else {
      // For public access, only return safe settings
      const allSettings = await SettingsService.getAllSettings();
      
      // Filter out sensitive settings if any
      const publicSettings = Object.fromEntries(
        Object.entries(allSettings).filter(([key]) => 
          !key.includes('secret') && 
          !key.includes('private') && 
          !key.includes('key')
        )
      );
      
      settings = publicSettings;
    }

    // Cache for 5 minutes
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Get public settings error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
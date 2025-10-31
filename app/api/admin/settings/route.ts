import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { SettingsService } from '@/lib/services/settings.service';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Schema for updating settings
const updateSettingsSchema = z.record(z.string(), z.string());

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let settings;
    if (category) {
      settings = await SettingsService.getSettingsByCategory(category);
    } else {
      settings = await SettingsService.getAllSettings();
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Get settings error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const settings = updateSettingsSchema.parse(body);

    // Validate settings
    const validation = SettingsService.validateSettings(settings);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    await SettingsService.updateSettings(settings);

    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    console.error('Update settings error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Initialize default settings (useful for setup)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    await SettingsService.initializeDefaults();

    return NextResponse.json({ 
      success: true,
      message: 'Default settings initialized'
    });
  } catch (error: any) {
    console.error('Initialize settings error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initialize settings' },
      { status: 500 }
    );
  }
}
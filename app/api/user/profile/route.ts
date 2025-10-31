import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profile.service';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const profile = await ProfileService.getProfile(session.user.id);

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Get profile error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updatedProfile = await ProfileService.updateProfile(
      session.user.id,
      data
    );

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

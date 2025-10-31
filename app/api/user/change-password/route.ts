import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profile.service';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    await ProfileService.changePassword(
      session.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error: unknown) {
    console.error('Change password error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid password format', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

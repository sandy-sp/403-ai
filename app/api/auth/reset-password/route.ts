import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/lib/services/password-reset.service';
import { resetPasswordSchema } from '@/lib/validations/auth';
import {
  InvalidTokenError,
  ExpiredTokenError,
  TokenAlreadyUsedError,
} from '@/lib/errors';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { token, ...passwordData } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Validate password data
    const validatedData = resetPasswordSchema.parse(passwordData);

    // Reset password
    await PasswordResetService.resetPassword(token, validatedData.password);

    return NextResponse.json(
      {
        message: 'Password reset successfully. You can now sign in with your new password.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid password format', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof InvalidTokenError) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (error instanceof ExpiredTokenError) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (error instanceof TokenAlreadyUsedError) {
      return NextResponse.json(
        { error: 'This reset token has already been used.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

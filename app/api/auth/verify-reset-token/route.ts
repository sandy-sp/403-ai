import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/lib/services/password-reset.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', valid: false },
        { status: 400 }
      );
    }

    // Validate token
    const isValid = await PasswordResetService.validateResetToken(token);

    if (!isValid) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    // Get user email for display (optional)
    const email = await PasswordResetService.getUserEmailFromToken(token);

    return NextResponse.json(
      {
        valid: true,
        email: email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null, // Partially mask email
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify reset token error:', error);

    return NextResponse.json(
      { error: 'Failed to verify token', valid: false },
      { status: 500 }
    );
  }
}

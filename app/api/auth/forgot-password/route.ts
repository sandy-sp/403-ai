import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/lib/services/password-reset.service';
import { EmailService } from '@/lib/services/email.service';
import { resetPasswordRequestSchema } from '@/lib/validations/auth';
import { RateLimitError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

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
    const validatedData = resetPasswordRequestSchema.parse(body);

    const email = validatedData.email.toLowerCase();

    // Check rate limiting
    const canRequest = await PasswordResetService.canRequestReset(email);
    if (!canRequest) {
      throw new RateLimitError(
        'Too many password reset requests. Please try again later.'
      );
    }

    // Request password reset (generates token)
    const token = await PasswordResetService.requestPasswordReset(email);

    // Get user details for email (if user exists)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, email: true },
    });

    // Send email only if user exists
    if (user) {
      await EmailService.sendPasswordResetEmail(user.email, token, user.name);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive a password reset link.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

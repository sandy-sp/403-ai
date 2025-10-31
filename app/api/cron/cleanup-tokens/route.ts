import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/lib/services/password-reset.service';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up expired password reset tokens
    const deletedCount = await PasswordResetService.cleanupExpiredTokens();

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired tokens`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup tokens' },
      { status: 500 }
    );
  }
}

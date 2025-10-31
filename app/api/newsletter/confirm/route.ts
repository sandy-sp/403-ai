import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter.service';
import { NotFoundError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Confirm subscription
    await NewsletterService.confirmSubscription(email);

    // Redirect to a success page or home page with success message
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('subscribed', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Newsletter confirm error:', error);

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}

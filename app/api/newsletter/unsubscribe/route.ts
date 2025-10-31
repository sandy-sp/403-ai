import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await NewsletterService.unsubscribe(email);

    return NextResponse.json(
      { message: 'Successfully unsubscribed from newsletter' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);

    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// Also support GET for email links
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

    await NewsletterService.unsubscribe(email);

    // Redirect to home page with unsubscribe confirmation
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('unsubscribed', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);

    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

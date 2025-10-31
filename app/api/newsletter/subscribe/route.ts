import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter.service';
import { EmailService } from '@/lib/services/email.service';
import { z } from 'zod';
import { ConflictError } from '@/lib/errors';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Subscribe
    const token = await NewsletterService.subscribe(email);

    // Send confirmation email
    try {
      await EmailService.sendNewsletterConfirmation(email, token);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json(
      {
        message:
          'Successfully subscribed! Please check your email to confirm your subscription.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { PasswordResetEmail } from '@/lib/email/templates/password-reset';
import { NewsletterConfirmationEmail } from '@/lib/email/templates/newsletter-confirmation';
import { CommentNotificationEmail } from '@/lib/email/templates/comment-notification';
import { WelcomeEmail } from '@/lib/email/templates/welcome';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@403-ai.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class EmailService {
  /**
   * Send password reset email
   * @param email - Recipient email
   * @param resetToken - Password reset token
   * @param userName - User's name
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    try {
      const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

      const html = await render(
        PasswordResetEmail({
          userName,
          resetLink,
        })
      );

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset Your 403 AI Password',
        html,
      });

      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send newsletter confirmation email
   * @param email - Recipient email
   * @param confirmToken - Confirmation token
   */
  static async sendNewsletterConfirmation(
    email: string,
    confirmToken: string
  ): Promise<void> {
    try {
      const confirmLink = `${APP_URL}/api/newsletter/confirm?token=${confirmToken}`;

      const html = await render(
        NewsletterConfirmationEmail({
          confirmLink,
        })
      );

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Confirm Your 403 AI Newsletter Subscription',
        html,
      });

      console.log(`Newsletter confirmation email sent to ${email}`);
    } catch (error) {
      console.error('Error sending newsletter confirmation email:', error);
      throw new Error('Failed to send newsletter confirmation email');
    }
  }

  /**
   * Send comment notification to admin
   * @param adminEmail - Admin email
   * @param commentData - Comment details
   */
  static async sendCommentNotification(
    adminEmail: string,
    commentData: {
      postTitle: string;
      postSlug: string;
      commentAuthor: string;
      commentContent: string;
      commentId: string;
    }
  ): Promise<void> {
    try {
      const postUrl = `${APP_URL}/blog/${commentData.postSlug}`;
      const moderationUrl = `${APP_URL}/admin/comments`;

      const html = await render(
        CommentNotificationEmail({
          postTitle: commentData.postTitle,
          postUrl,
          commentAuthor: commentData.commentAuthor,
          commentContent: commentData.commentContent,
          moderationUrl,
        })
      );

      await resend.emails.send({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: `New Comment on "${commentData.postTitle}"`,
        html,
      });

      console.log(`Comment notification email sent to ${adminEmail}`);
    } catch (error) {
      console.error('Error sending comment notification email:', error);
      // Don't throw error - comment should still be created even if email fails
    }
  }

  /**
   * Send welcome email to new user
   * @param email - User email
   * @param userName - User's name
   */
  static async sendWelcomeEmail(
    email: string,
    userName: string
  ): Promise<void> {
    try {
      const loginUrl = `${APP_URL}/signin`;

      const html = await render(
        WelcomeEmail({
          userName,
          loginUrl,
        })
      );

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to 403 AI - Forbidden AI',
        html,
      });

      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error - user should still be created even if email fails
    }
  }

  /**
   * Send newsletter with new post to subscribers
   * @param subscribers - Array of subscriber emails
   * @param postData - Post details
   */
  static async sendNewsletter(
    subscribers: string[],
    postData: {
      title: string;
      excerpt: string;
      slug: string;
      featuredImageUrl?: string;
    }
  ): Promise<void> {
    try {
      const postUrl = `${APP_URL}/blog/${postData.slug}`;

      // Send in batches of 100 to avoid rate limits
      const batchSize = 100;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);

        await Promise.all(
          batch.map((email) =>
            resend.emails.send({
              from: FROM_EMAIL,
              to: email,
              subject: `New Post: ${postData.title}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #1A1F3A; padding: 40px; border-radius: 8px;">
                  <h1 style="color: #00FFD1; margin-bottom: 20px;">${postData.title}</h1>
                  ${
                    postData.featuredImageUrl
                      ? `<img src="${postData.featuredImageUrl}" alt="${postData.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />`
                      : ''
                  }
                  <p style="color: #B0B3C1; font-size: 16px; line-height: 26px;">${postData.excerpt}</p>
                  <a href="${postUrl}" style="display: inline-block; background-color: #00FFD1; color: #0A0E27; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px;">Read More</a>
                  <p style="color: #B0B3C1; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2F4A;">
                    You're receiving this because you subscribed to 403 AI newsletter.
                    <br />
                    <a href="${APP_URL}/api/newsletter/unsubscribe?email=${email}" style="color: #00FFD1;">Unsubscribe</a>
                  </p>
                </div>
              `,
            })
          )
        );

        // Wait a bit between batches to avoid rate limits
        if (i + batchSize < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(`Newsletter sent to ${subscribers.length} subscribers`);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw new Error('Failed to send newsletter');
    }
  }

  /**
   * Test email configuration
   * Sends a test email to verify setup
   */
  static async sendTestEmail(email: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Test Email from 403 AI',
        html: '<p>This is a test email. Your email configuration is working correctly!</p>',
      });

      console.log(`Test email sent to ${email}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      throw new Error('Failed to send test email');
    }
  }
}

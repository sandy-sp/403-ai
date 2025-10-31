import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  generateSecureToken,
  generateTokenExpiration,
} from '@/lib/utils/crypto';
import {
  NotFoundError,
  InvalidTokenError,
  ExpiredTokenError,
  TokenAlreadyUsedError,
  handlePrismaError,
} from '@/lib/errors';

export class PasswordResetService {
  /**
   * Request a password reset for a user
   * Generates a secure token and stores it in the database
   * @param email - User's email address
   * @returns Reset token (to be sent via email)
   */
  static async requestPasswordReset(email: string): Promise<string> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // For security, don't reveal if user exists
      // But still generate a token to prevent timing attacks
      if (!user) {
        // Generate a dummy token to maintain consistent response time
        generateSecureToken();
        return 'token-generated';
      }

      // Generate secure token
      const token = generateSecureToken(32);
      const expiresAt = generateTokenExpiration(1); // 1 hour

      // Delete any existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      return token;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Validate a reset token
   * Checks if token exists, is not expired, and hasn't been used
   * @param token - Reset token
   * @returns Boolean indicating if token is valid
   */
  static async validateResetToken(token: string): Promise<boolean> {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        return false;
      }

      if (resetToken.used) {
        return false;
      }

      if (new Date() > resetToken.expiresAt) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Reset user password using a valid token
   * @param token - Reset token
   * @param newPassword - New password (plain text, will be hashed)
   * @throws InvalidTokenError if token is invalid
   * @throws ExpiredTokenError if token has expired
   * @throws TokenAlreadyUsedError if token has been used
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Find the reset token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new InvalidTokenError('Invalid reset token');
      }

      if (resetToken.used) {
        throw new TokenAlreadyUsedError();
      }

      if (new Date() > resetToken.expiresAt) {
        throw new ExpiredTokenError();
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user password and mark token as used in a transaction
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ]);
    } catch (error) {
      if (
        error instanceof InvalidTokenError ||
        error instanceof ExpiredTokenError ||
        error instanceof TokenAlreadyUsedError
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Get user email from reset token (for display purposes)
   * @param token - Reset token
   * @returns User email or null if token is invalid
   */
  static async getUserEmailFromToken(token: string): Promise<string | null> {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
        return null;
      }

      return resetToken.user.email;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clean up expired tokens (should be run periodically via cron)
   * Deletes all tokens that have expired
   * @returns Number of tokens deleted
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * Check if user has recently requested a reset (rate limiting)
   * @param email - User's email
   * @returns Boolean indicating if user can request another reset
   */
  static async canRequestReset(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return true; // Don't reveal if user exists
      }

      // Check for recent reset requests (within last hour)
      const recentTokens = await prisma.passwordResetToken.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      // Allow max 3 requests per hour
      return recentTokens < 3;
    } catch (error) {
      return false;
    }
  }
}

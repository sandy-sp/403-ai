import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NotFoundError, ValidationError, handlePrismaError } from '@/lib/errors';

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export class ProfileService {
  /**
   * Get user profile
   * @param userId - User ID
   * @returns User profile
   */
  static async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param data - Profile update data
   */
  static async updateProfile(userId: string, data: ProfileUpdateData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          avatarUrl: true,
          role: true,
        },
      });

      return user;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new ValidationError('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }

  /**
   * Upload avatar (returns Cloudinary URL)
   * This is a placeholder - actual upload happens in the API route
   * @param userId - User ID
   * @param avatarUrl - Cloudinary URL
   */
  static async uploadAvatar(userId: string, avatarUrl: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          avatarUrl: true,
        },
      });

      return user;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Delete user avatar
   * @param userId - User ID
   */
  static async deleteAvatar(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateShort } from '@/lib/utils/date';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface Props {
  user: {
    id: string;
    email: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    role: string;
    createdAt: Date;
  };
}

export function ProfileEditor({ user }: Props) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdating(true);

    try {
      // Upload avatar if changed
      let avatarUrl = user.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const avatarResponse = await fetch('/api/user/avatar', {
          method: 'POST',
          body: formData,
        });

        if (!avatarResponse.ok) {
          throw new Error('Failed to upload avatar');
        }

        const avatarData = await avatarResponse.json();
        avatarUrl = avatarData.avatarUrl;
      }

      // Update profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      resetPassword();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Profile Information</h2>

        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="label">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-secondary-light flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-text-secondary" />
                )}
              </div>
              <div>
                <label className="btn-outline cursor-pointer">
                  <Upload size={18} className="mr-2" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-text-secondary mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              {...registerProfile('name')}
              type="text"
              id="name"
              className="input"
              disabled={isUpdating}
            />
            {profileErrors.name && (
              <p className="text-status-error text-sm mt-1">
                {profileErrors.name.message}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              className="input"
              disabled
            />
            <p className="text-xs text-text-secondary mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="label">
              Bio
            </label>
            <textarea
              {...registerProfile('bio')}
              id="bio"
              rows={4}
              className="input"
              placeholder="Tell us about yourself..."
              disabled={isUpdating}
            />
            {profileErrors.bio && (
              <p className="text-status-error text-sm mt-1">
                {profileErrors.bio.message}
              </p>
            )}
          </div>

          {/* Role & Created */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <div className="px-3 py-2 bg-secondary-light rounded-lg">
                <span className="font-medium">{user.role}</span>
              </div>
            </div>
            <div>
              <label className="label">Member Since</label>
              <div className="px-3 py-2 bg-secondary-light rounded-lg">
                <span className="font-medium">
                  {formatDateShort(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Change Password</h2>

        <form
          onSubmit={handleSubmitPassword(onSubmitPassword)}
          className="space-y-6"
        >
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="label">
              Current Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                className="input pr-10"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-status-error text-sm mt-1">
                {passwordErrors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="label">
              New Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                className="input pr-10"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-status-error text-sm mt-1">
                {passwordErrors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirm New Password
            </label>
            <input
              {...registerPassword('confirmPassword')}
              type="password"
              id="confirmPassword"
              className="input"
              disabled={isChangingPassword}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-status-error text-sm mt-1">
                {passwordErrors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

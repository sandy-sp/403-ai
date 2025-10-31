'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestInput,
} from '@/lib/validations/auth';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const onSubmit = async (data: ResetPasswordRequestInput) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to send reset email');
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-accent-cyan" size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
            <p className="text-text-secondary">
              If an account exists with the email you provided, you will receive
              a password reset link shortly.
            </p>
          </div>

          <div className="card">
            <div className="space-y-4">
              <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg p-4">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">
                    Didn't receive the email?
                  </strong>
                  <br />
                  Check your spam folder or try again in a few minutes.
                </p>
              </div>

              <Link
                href="/signin"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            403 AI
          </h1>
          <p className="text-text-secondary">Reset your password</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <p className="text-text-secondary text-sm mb-6">
                Enter your email address and we'll send you a link to reset
                your password.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input"
                placeholder="you@example.com"
                disabled={isLoading}
                autoFocus
              />
              {errors.email && (
                <p className="text-status-error text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link
                href="/signin"
                className="text-sm text-accent-cyan hover:text-accent-cyan/80 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

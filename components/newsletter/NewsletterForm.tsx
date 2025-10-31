'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to subscribe');
        return;
      }

      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-status-success/10 border border-status-success rounded-lg p-6 text-center">
        <CheckCircle2 className="text-status-success mx-auto mb-3" size={48} />
        <h3 className="text-xl font-bold mb-2">Check Your Email!</h3>
        <p className="text-text-secondary">
          We've sent you a confirmation link. Please check your inbox to complete your subscription.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={20}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="input pl-10 w-full"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="btn-primary whitespace-nowrap"
          disabled={isLoading}
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>

      <p className="text-xs text-text-secondary">
        Get the latest AI research and news delivered to your inbox. Unsubscribe anytime.
      </p>
    </form>
  );
}

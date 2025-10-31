import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   */
  check(request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);

    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    let entry = rateLimitStore.get(key);

    // Create new entry if doesn't exist or expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment count
    entry.count++;

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const allowed = entry.count <= this.config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  /**
   * Get default key based on IP address
   */
  private getDefaultKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : (realIp || 'unknown');
    return `rate_limit:${ip}`;
  }
}

// Pre-configured rate limiters
export const commentRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 comments per 15 minutes
  keyGenerator: (request) => {
    // Use user ID if authenticated, otherwise IP
    const userId = request.headers.get('x-user-id');
    if (userId) {
      return `comment_rate_limit:user:${userId}`;
    }
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : (realIp || 'unknown');
    return `comment_rate_limit:ip:${ip}`;
  },
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const passwordResetRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
});

/**
 * Middleware function to apply rate limiting
 */
export function withRateLimit(rateLimiter: RateLimiter) {
  return (request: NextRequest) => {
    const result = rateLimiter.check(request);
    
    if (!result.allowed) {
      return {
        error: 'Too many requests',
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          'Retry-After': (result.retryAfter || 60).toString(),
        } as Record<string, string>,
      };
    }

    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      } as Record<string, string>,
    };
  };
}
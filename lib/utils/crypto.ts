import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param bytes - Number of random bytes (default: 32)
 * @returns Hex string token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a token for storage (optional additional security layer)
 * @param token - Token to hash
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a token expiration date
 * @param hours - Number of hours until expiration (default: 1)
 * @returns Date object
 */
export function generateTokenExpiration(hours: number = 1): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

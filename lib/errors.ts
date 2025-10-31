export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export function handlePrismaError(error: any): never {
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    throw new ConflictError(`A record with this ${field} already exists`);
  }
  
  if (error.code === 'P2025') {
    throw new NotFoundError('Record');
  }
  
  if (error.code === 'P2003') {
    throw new ValidationError('Invalid reference to related record');
  }
  
  throw error;
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid or expired token') {
    super(400, message, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
  }
}

export class ExpiredTokenError extends AppError {
  constructor(message: string = 'Token has expired') {
    super(400, message, 'EXPIRED_TOKEN');
    this.name = 'ExpiredTokenError';
  }
}

export class TokenAlreadyUsedError extends AppError {
  constructor(message: string = 'Token has already been used') {
    super(400, message, 'TOKEN_ALREADY_USED');
    this.name = 'TokenAlreadyUsedError';
  }
}

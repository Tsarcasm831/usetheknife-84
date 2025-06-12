
/**
 * Security utilities for input validation and sanitization
 */

// Simple HTML sanitization - removes script tags and other dangerous elements
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .trim();
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Username validation
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Simple client-side rate limiter
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canAttempt(action: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const key = action;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const actionAttempts = this.attempts.get(key)!;
    
    // Remove old attempts outside the time window
    const validAttempts = actionAttempts.filter(time => now - time < windowMs);
    this.attempts.set(key, validAttempts);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    return true;
  }
  
  getRemainingAttempts(action: string, maxAttempts: number, windowMs: number): number {
    const now = Date.now();
    const key = action;
    
    if (!this.attempts.has(key)) {
      return maxAttempts;
    }
    
    const actionAttempts = this.attempts.get(key)!;
    const validAttempts = actionAttempts.filter(time => now - time < windowMs);
    
    return Math.max(0, maxAttempts - validAttempts.length);
  }
}

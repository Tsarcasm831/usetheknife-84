
// Security utilities for client-side validation and sanitization

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>'";&\\]/g, '')
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validates username format
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  
  // 3-50 characters, alphanumeric plus underscore/dash
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
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
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rate limiting helper for client-side
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canAttempt(action: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const actionAttempts = this.attempts.get(action) || [];
    const recentAttempts = actionAttempts.filter(time => time > windowStart);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(action, recentAttempts);
    return true;
  }
  
  getRemainingAttempts(action: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const actionAttempts = this.attempts.get(action) || [];
    const recentAttempts = actionAttempts.filter(time => time > windowStart);
    
    return Math.max(0, maxAttempts - recentAttempts.length);
  }
}

/**
 * Secure local storage wrapper
 */
export class SecureStorage {
  static set(key: string, value: unknown): void {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.setItem(sanitizedKey, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
  
  static get(key: string): unknown {
    try {
      const sanitizedKey = sanitizeInput(key);
      const item = localStorage.getItem(sanitizedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }
  
  static remove(key: string): void {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
}

